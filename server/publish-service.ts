import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import type { AppOwnerAccount, AppOwnerProfile } from './db.ts';

const OWNER_BSC_WALLET = '0xdf90b9c9703b6ffd96d9dc195fffe81ecb71d83e';
const REQUIRED_FEE_USD = 25.0;

// Official BNB Smart Chain USD stablecoin contracts (18 decimals)
const BSC_STABLECOINS: Record<string, { symbol: string; decimals: number }> = {
  '0x55d398326f99059ff775485246999027b3197955': { symbol: 'USDT (BEP-20)', decimals: 18 },
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': { symbol: 'USDC (BEP-20)', decimals: 18 },
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': { symbol: 'BUSD (BEP-20)', decimals: 18 },
};

// keccak256("Transfer(address,address,uint256)")
const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const BSC_RPC_ENDPOINTS = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-rpc.publicnode.com',
  'https://bsc-dataseed1.defibit.io/',
];

const SECRET_FILE = path.resolve(process.cwd(), 'data/.publish-secret');

function getHmacSecret(): string {
  if (process.env.MRS_PAYMENT_SECRET && process.env.MRS_PAYMENT_SECRET.length >= 16) {
    return process.env.MRS_PAYMENT_SECRET;
  }
  try {
    const dir = path.dirname(SECRET_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(SECRET_FILE)) {
      const saved = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (saved.length >= 32) return saved;
    }
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { encoding: 'utf-8', mode: 0o600 });
    return generated;
  } catch {
    return crypto.createHash('sha256').update(process.cwd() + ':mrs-publish-runtime').digest('hex');
  }
}

export interface PaymentVerificationTokenPayload {
  txHash: string;
  paymentMethod: string;
  amountPaidUsd: number;
  fromAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
  issuedAt: number;
}

export function issuePaymentVerificationToken(
  payload: PaymentVerificationTokenPayload
): string {
  const secret = getHmacSecret();
  const body = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyPaymentVerificationToken(
  token: string,
  expectedTxHash: string,
  expectedMethod: string
): { valid: boolean; payload?: PaymentVerificationTokenPayload; message?: string } {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 2) {
      return { valid: false, message: 'Invalid payment verification token.' };
    }
    const [body, sig] = parts;
    const secret = getHmacSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf-8');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, message: 'Payment verification signature mismatch.' };
    }

    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as PaymentVerificationTokenPayload;
    if (!parsed || typeof parsed.issuedAt !== 'number') {
      return { valid: false, message: 'Malformed payment token payload.' };
    }
    // Valid for 2 hours from verification
    if (Date.now() - parsed.issuedAt > 2 * 60 * 60 * 1000) {
      return { valid: false, message: 'Payment verification session expired. Please verify your TxHash again.' };
    }
    if (parsed.txHash.toLowerCase() !== expectedTxHash.trim().toLowerCase()) {
      return { valid: false, message: 'Transaction hash does not match verified payment session.' };
    }
    if (parsed.paymentMethod !== expectedMethod) {
      return { valid: false, message: 'Payment method does not match verified payment session.' };
    }
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, message: 'Unable to validate payment token.' };
  }
}

async function callBscRpc<T = unknown>(method: string, params: unknown[]): Promise<T> {
  let lastError = 'Unable to reach BNB Smart Chain RPC node.';
  for (const rpcUrl of BSC_RPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        lastError = `RPC HTTP ${res.status}`;
        continue;
      }
      const data = (await res.json()) as { result?: T; error?: { message?: string } };
      if (data.error) {
        lastError = data.error.message || lastError;
        continue;
      }
      return data.result as T;
    } catch (err: any) {
      lastError = err?.message || lastError;
    }
  }
  throw new Error(lastError);
}

interface BscLog {
  address: string;
  topics: string[];
  data: string;
}

interface BscReceipt {
  status?: string;
  from?: string;
  to?: string;
  blockNumber?: string;
  logs?: BscLog[];
}

export interface BscVerificationResult {
  verified: boolean;
  message: string;
  tokenSymbol?: string;
  amountPaidUsd?: number;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  explorerUrl?: string;
}

export async function verifyBscUsdtPayment(txHashRaw: string): Promise<BscVerificationResult> {
  const txHash = txHashRaw.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return {
      verified: false,
      message: 'Enter a valid 66-character BNB Smart Chain (BEP-20) transaction hash starting with 0x.',
    };
  }

  try {
    const [receipt, latestBlockHex] = await Promise.all([
      callBscRpc<BscReceipt | null>('eth_getTransactionReceipt', [txHash]),
      callBscRpc<string>('eth_blockNumber', []),
    ]);

    if (!receipt) {
      return {
        verified: false,
        message: 'Transaction hash not found on BNB Smart Chain yet. Wait for confirmation and try again.',
      };
    }

    if (receipt.status !== '0x1') {
      return {
        verified: false,
        message: 'This BNB Smart Chain transaction failed or was reverted on-chain.',
      };
    }

    const paddedOwnerTopic = `0x000000000000000000000000${OWNER_BSC_WALLET.slice(2)}`;
    let matchedTokenSymbol = '';
    let totalReceivedUsd = 0;
    let senderAddress = receipt.from || '';

    for (const log of receipt.logs || []) {
      const contract = (log.address || '').toLowerCase();
      const tokenInfo = BSC_STABLECOINS[contract];
      if (!tokenInfo) continue;

      const topics = log.topics || [];
      if (
        topics.length >= 3 &&
        topics[0]?.toLowerCase() === ERC20_TRANSFER_TOPIC &&
        topics[2]?.toLowerCase() === paddedOwnerTopic
      ) {
        const rawValue = BigInt(log.data || '0x0');
        const divisor = 10n ** BigInt(tokenInfo.decimals);
        const whole = Number(rawValue / divisor);
        const frac = Number(rawValue % divisor) / Number(divisor);
        totalReceivedUsd += whole + frac;
        matchedTokenSymbol = tokenInfo.symbol;
        if (topics[1]?.length === 66) {
          senderAddress = `0x${topics[1].slice(26)}`;
        }
      }
    }

    if (totalReceivedUsd <= 0) {
      return {
        verified: false,
        message: `No BEP-20 USDT/USDC transfer to store wallet ${OWNER_BSC_WALLET} was found inside this transaction.`,
      };
    }

    if (totalReceivedUsd + 0.0001 < REQUIRED_FEE_USD) {
      return {
        verified: false,
        message: `Transaction transferred $${totalReceivedUsd.toFixed(2)} USD, which is below the required $${REQUIRED_FEE_USD.toFixed(2)} USD publishing fee.`,
      };
    }

    const txBlock = receipt.blockNumber ? parseInt(receipt.blockNumber, 16) : 0;
    const latestBlock = latestBlockHex ? parseInt(latestBlockHex, 16) : txBlock;
    const confirmations = Math.max(1, latestBlock - txBlock + 1);

    return {
      verified: true,
      message: `Verified $${totalReceivedUsd.toFixed(2)} ${matchedTokenSymbol} transfer to store wallet on BNB Smart Chain.`,
      tokenSymbol: matchedTokenSymbol,
      amountPaidUsd: Number(totalReceivedUsd.toFixed(2)),
      fromAddress: senderAddress,
      toAddress: OWNER_BSC_WALLET,
      blockNumber: txBlock,
      confirmations,
      explorerUrl: `https://bscscan.com/tx/${txHash}`,
    };
  } catch (err: any) {
    return {
      verified: false,
      message: `BNB Smart Chain verification unavailable: ${err?.message || 'RPC timeout'}`,
    };
  }
}

export interface ApkInspectionResult {
  isValidZip: boolean;
  totalEntries: number;
  hasAndroidManifest: boolean;
  hasClassesDex: boolean;
  hasResources: boolean;
  architectures: string[];
}

export function inspectApkArchive(buf: Buffer): ApkInspectionResult {
  if (!Buffer.isBuffer(buf) || buf.length < 128 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
    return {
      isValidZip: false,
      totalEntries: 0,
      hasAndroidManifest: false,
      hasClassesDex: false,
      hasResources: false,
      architectures: [],
    };
  }

  let eocd = -1;
  const searchFloor = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= searchFloor; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }

  if (eocd === -1) {
    const hasManifestRaw = buf.includes(Buffer.from('AndroidManifest.xml'));
    return {
      isValidZip: true,
      totalEntries: 0,
      hasAndroidManifest: hasManifestRaw,
      hasClassesDex: buf.includes(Buffer.from('classes.dex')),
      hasResources: buf.includes(Buffer.from('resources.arsc')),
      architectures: [],
    };
  }

  const cdOffset = buf.readUInt32LE(eocd + 16);
  const totalEntries = buf.readUInt16LE(eocd + 10);
  let pos = cdOffset;
  let hasAndroidManifest = false;
  let hasClassesDex = false;
  let hasResources = false;
  const abis = new Set<string>();

  for (let j = 0; j < totalEntries && pos + 46 <= buf.length; j++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);

    if (name === 'AndroidManifest.xml') hasAndroidManifest = true;
    if (/^classes\d*\.dex$/.test(name)) hasClassesDex = true;
    if (name === 'resources.arsc') hasResources = true;
    const libMatch = name.match(/^lib\/([^/]+)\//);
    if (libMatch && libMatch[1]) abis.add(libMatch[1]);

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return {
    isValidZip: true,
    totalEntries,
    hasAndroidManifest,
    hasClassesDex,
    hasResources,
    architectures: Array.from(abis),
  };
}

export async function fetchGravatarProfileByHandle(
  handleRaw: string
): Promise<{ success: boolean; profile?: AppOwnerProfile; message?: string }> {
  const cleanHandle = handleRaw
    .trim()
    .replace(/^https?:\/\/(en\.|www\.)?gravatar\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\.json$/i, '')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  if (!cleanHandle) {
    return { success: false, message: 'Enter a valid Gravatar username or profile URL.' };
  }

  try {
    const res = await fetch(`https://gravatar.com/${encodeURIComponent(cleanHandle)}.json`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return {
        success: false,
        message: `Gravatar profile "${cleanHandle}" was not found (HTTP ${res.status}).`,
      };
    }
    const json: any = await res.json();
    const entry = json?.entry?.[0];
    if (!entry) {
      return { success: false, message: `No public Gravatar entry found for "${cleanHandle}".` };
    }

    const cleanBioLines = String(entry.aboutMe || '')
      .split(/\r?\n/)
      .map((line: string) => line.replace(/[#*`>_]/g, '').trim())
      .filter(Boolean);
    const headline = cleanBioLines[0]
      ?.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, '')
      .trim();

    const accounts: AppOwnerAccount[] = Array.isArray(entry.accounts)
      ? entry.accounts
          .filter((acc: any) => acc?.url && !String(acc.url).toLowerCase().includes('blogspot'))
          .map((acc: any) => ({
            name: String(acc.name || acc.domain || 'Link'),
            username: String(acc.username || acc.display || ''),
            url: String(acc.url),
            verified: Boolean(acc.verified),
          }))
      : [];

    const calContact = Array.isArray(entry.contactInfo)
      ? entry.contactInfo.find(
          (c: any) => c?.type === 'calendar' && c?.value && !String(c.value).toLowerCase().includes('blogspot')
        )
      : null;

    const email =
      Array.isArray(entry.emails) && entry.emails[0]?.value
        ? String(entry.emails[0].value)
        : '';

    const phone =
      Array.isArray(entry.phoneNumbers) && entry.phoneNumbers[0]?.value
        ? String(entry.phoneNumbers[0].value)
        : undefined;

    return {
      success: true,
      profile: {
        displayName: String(entry.displayName || cleanHandle),
        username: String(entry.preferredUsername || cleanHandle),
        profileUrl: String(entry.profileUrl || `https://gravatar.com/${cleanHandle}`),
        avatarUrl: entry.thumbnailUrl ? `${String(entry.thumbnailUrl)}?s=256` : '',
        email,
        phone,
        headline: headline || undefined,
        bio: cleanBioLines.slice(0, 3).join(' ').slice(0, 320) || undefined,
        calendarUrl: calContact ? String(calContact.value) : undefined,
        accounts,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Unable to connect to Gravatar profile service.',
    };
  }
}

function isPrivateOrReservedIp(ipRaw: string): boolean {
  const ip = ipRaw.replace(/^\[|\]$/g, '').toLowerCase();
  const ver = net.isIP(ip);
  if (ver === 4) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }
  if (ver === 6) {
    if (ip === '::1' || ip === '::') return true;
    if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) return true;
    if (ip.startsWith('::ffff:')) {
      return isPrivateOrReservedIp(ip.slice(7));
    }
    return false;
  }
  return true;
}

async function assertSafeExternalUrl(urlStr: string): Promise<{ safe: boolean; parsed?: URL; message?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { safe: false, message: 'Enter a valid HTTP or HTTPS APK download URL.' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { safe: false, message: 'Only HTTPS or HTTP APK URLs are supported.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  ) {
    return { safe: false, message: 'Internal or localhost APK URLs are not permitted.' };
  }

  if (net.isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      return { safe: false, message: 'Private or reserved network IP URLs are not permitted.' };
    }
    return { safe: true, parsed };
  }

  try {
    const records = await dns.lookup(host, { all: true });
    if (!records.length || records.some((r) => isPrivateOrReservedIp(r.address))) {
      return { safe: false, message: 'APK URL hostname resolves to a private or restricted IP address.' };
    }
  } catch {
    return { safe: false, message: `Unable to resolve hostname "${host}".` };
  }

  return { safe: true, parsed };
}

export async function verifyExternalApkUrl(urlStr: string): Promise<{
  valid: boolean;
  reachable: boolean;
  finalUrl?: string;
  size?: string;
  message: string;
}> {
  let currentUrl = urlStr.trim();

  for (let hop = 0; hop < 4; hop++) {
    const check = await assertSafeExternalUrl(currentUrl);
    if (!check.safe) {
      return { valid: false, reachable: false, message: check.message || 'Unsafe APK URL.' };
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let res = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) {
          return { valid: false, reachable: false, message: 'Redirect response missing target URL.' };
        }
        currentUrl = new URL(loc, currentUrl).toString();
        continue;
      }

      if (res.status === 405 || res.status === 501) {
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), 8000);
        res = await fetch(currentUrl, {
          method: 'GET',
          headers: { Range: 'bytes=0-1023' },
          redirect: 'manual',
          signal: c2.signal,
        });
        clearTimeout(t2);
      }

      if (!res.ok) {
        return {
          valid: false,
          reachable: false,
          message: `External APK URL returned HTTP ${res.status}. Verify the link is publicly downloadable.`,
        };
      }

      const lenHeader = res.headers.get('content-length');
      const bytes = lenHeader ? parseInt(lenHeader, 10) : 0;
      const size =
        bytes > 0 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : undefined;

      return {
        valid: true,
        reachable: true,
        finalUrl: currentUrl,
        size,
        message: 'External APK download URL verified reachable.',
      };
    } catch (err: any) {
      return {
        valid: false,
        reachable: false,
        message: `Could not reach external APK URL: ${err?.message || 'network timeout'}`,
      };
    }
  }

  return {
    valid: false,
    reachable: false,
    message: 'Too many redirects while verifying external APK URL.',
  };
}

export async function checkBscRpcHealth() {
  const results = await Promise.all(
    BSC_RPC_ENDPOINTS.map(async (endpoint) => {
      const started = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        const json: any = await res.json().catch(() => null);
        const latestBlock = json?.result ? parseInt(json.result, 16) : null;
        return {
          endpoint,
          healthy: res.ok && typeof latestBlock === 'number' && !Number.isNaN(latestBlock),
          latestBlock,
          latencyMs: Date.now() - started,
        };
      } catch {
        return {
          endpoint,
          healthy: false,
          latestBlock: null,
          latencyMs: Date.now() - started,
        };
      }
    })
  );

  return {
    healthyNodes: results.filter((r) => r.healthy).length,
    totalNodes: results.length,
    nodes: results,
  };
}
