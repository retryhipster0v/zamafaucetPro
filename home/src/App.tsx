// React import not required with automatic runtime
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'

import { ZamaInfo } from './components/ZamaInfo'
import { TokenCard } from './components/TokenCard'
import { BalanceSection } from './components/BalanceSection'
import { useEthersSigner } from './hooks/useEthersSigner'
import { useZamaInstance } from './hooks/useZamaInstance'

const TOKEN_ABI = [
  { inputs: [{ name: 'account', type: 'address' }], name: 'confidentialBalanceOf', outputs: [{ name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'amount', type: 'uint64' }], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'encryptedAmount', type: 'bytes32' }, { name: 'inputProof', type: 'bytes' }], name: 'mintEncrypted', outputs: [], stateMutability: 'nonpayable', type: 'function' },
] as const

const CONTRACT_ADDRESSES = {
  cETH: '0xd1797BE38f3e343Ce76b37a94F0F39Cd8Ac48B2D' as `0x${string}`,
  cBTC: '0x1F8aD236327ABdB05FcCe0Ab8fBf45cF3973CA9d' as `0x${string}`,
  cUSDC: '0xa14dfCf5582AF09deF54a6e37E156E354e4061a6' as `0x${string}`,
  cDAI: '0xb7e654C90216732B803b9eBF7567BaaabaD48Ce6' as `0x${string}`,
}

function toScale6(amount: string): bigint {
  const [intPart, fracRaw] = amount.split('.')
  const frac = (fracRaw || '').slice(0, 6).padEnd(6, '0')
  const normalized = `${intPart || '0'}${frac}`.replace(/^0+/, '')
  return BigInt(normalized === '' ? '0' : normalized)
}

const tokens = [
  { name: 'Confidential ETH', symbol: 'cETH', icon: 'Ξ', color: 'eth', tokenType: 0, displayAmount: '1' },
  { name: 'Confidential BTC', symbol: 'cBTC', icon: '₿', color: 'btc', tokenType: 1, displayAmount: '0.1' },
  { name: 'Confidential USDC', symbol: 'cUSDC', icon: '$', color: 'usdc', tokenType: 2, displayAmount: '500' },
  { name: 'Confidential DAI', symbol: 'cDAI', icon: '◈', color: 'dai', tokenType: 3, displayAmount: '750' },
]

function App() {
  const { address, isConnected } = useAccount()
  const signerPromise = useEthersSigner({})
  const { instance: relayer, isLoading: relayerLoading, error: relayerError } = useZamaInstance()

  const handleMintClear = async (symbol: string) => {
    const signer = await signerPromise
    if (!signer) return
    const addr = CONTRACT_ADDRESSES[symbol as keyof typeof CONTRACT_ADDRESSES]
    const contract = new ethers.Contract(addr, TOKEN_ABI as any, signer)
    const display = tokens.find(t => t.symbol === symbol)!.displayAmount
    const onchain = toScale6(display)
    const tx = await contract.mint(onchain)
    await tx.wait()
  }

  const handleMintEncrypted = async (symbol: string) => {
    const signer = await signerPromise
    if (!relayer) {
      window.alert('加密服务未初始化，请稍后重试或刷新页面。')
      return
    }
    if (!signer || !address) return
    const addr = CONTRACT_ADDRESSES[symbol as keyof typeof CONTRACT_ADDRESSES]
    const display = tokens.find(t => t.symbol === symbol)!.displayAmount
    const onchain = toScale6(display)
    const buf = relayer.createEncryptedInput(addr, address)
    buf.add64(onchain)
    const enc = await buf.encrypt()
    const contract = new ethers.Contract(addr, TOKEN_ABI as any, signer)
    const tx = await contract.mintEncrypted(enc.handles[0], enc.inputProof)
    await tx.wait()
  }

  return (
    <div className="App">
      <div className="hero">
        <div className="container">
          <h1>Zama Faucet</h1>
          <p>
            体验基于 Fully Homomorphic Encryption 的保密代币。连接钱包后，按代币分别铸造（明文或加密），然后在下方解密查看余额。
          </p>
          <div style={{ marginTop: '24px' }}>
            <ConnectButton />
          </div>
        </div>
      </div>

      <div className="container">
        {relayerLoading && (
          <div className="card" style={{ marginBottom: 16 }}>
            正在初始化加密服务（FHE Relayer）...
          </div>
        )}
        {!!relayerError && (
          <div className="card" style={{ marginBottom: 16, background: '#fff3cd', border: '1px solid #ffeaa7', color: '#856404' }}>
            加密服务初始化失败，请刷新页面重试。
          </div>
        )}
        <ZamaInfo />

        {isConnected && (
          <>
            <div className="grid">
              {tokens.map((token) => (
                <TokenCard
                  key={token.symbol}
                  token={token}
                  onMintClear={() => handleMintClear(token.symbol)}
                  onMintEncrypted={() => handleMintEncrypted(token.symbol)}
                />
              ))}
            </div>

            <BalanceSection
              address={address!}
              contractAddresses={CONTRACT_ADDRESSES}
              tokenAbi={TOKEN_ABI as any}
              relayer={relayer}
              signerPromise={signerPromise}
            />
          </>
        )}

        {!isConnected && (
          <div className="card">
            <h2>🔗 连接钱包</h2>
            <p>连接 Sepolia 钱包后开始铸造保密代币，并在本地解密查看余额。</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
