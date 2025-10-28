import React, { useState } from 'react'
import { useContractRead } from 'wagmi'

interface BalanceSectionProps {
  address: string
  contractAddresses: { cETH: string; cBTC: string; cUSDC: string; cDAI: string }
  tokenAbi: any[]
  relayer: any
  signerPromise: Promise<any> | undefined
}

interface TokenBalance {
  symbol: string
  name: string
  encryptedBalance: string
  decryptedBalance?: string
  isDecrypting: boolean
  color: string
  icon: string
}

export const BalanceSection: React.FC<BalanceSectionProps> = ({ address, contractAddresses, tokenAbi, relayer, signerPromise }) => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    { symbol: 'cETH', name: 'Confidential ETH', encryptedBalance: '', isDecrypting: false, color: 'eth', icon: 'Ξ' },
    { symbol: 'cBTC', name: 'Confidential BTC', encryptedBalance: '', isDecrypting: false, color: 'btc', icon: '₿' },
    { symbol: 'cUSDC', name: 'Confidential USDC', encryptedBalance: '', isDecrypting: false, color: 'usdc', icon: '$' },
    { symbol: 'cDAI', name: 'Confidential DAI', encryptedBalance: '', isDecrypting: false, color: 'dai', icon: '◈' },
  ])

  const { data: cETHBalance, refetch: refetchCETH } = useContractRead({ address: contractAddresses.cETH as `0x${string}`, abi: tokenAbi, functionName: 'confidentialBalanceOf', args: [address], query: { enabled: !!address && contractAddresses.cETH !== zero } })
  const { data: cBTCBalance, refetch: refetchCBTC } = useContractRead({ address: contractAddresses.cBTC as `0x${string}`, abi: tokenAbi, functionName: 'confidentialBalanceOf', args: [address], query: { enabled: !!address && contractAddresses.cBTC !== zero } })
  const { data: cUSDCBalance, refetch: refetchCUSDC } = useContractRead({ address: contractAddresses.cUSDC as `0x${string}`, abi: tokenAbi, functionName: 'confidentialBalanceOf', args: [address], query: { enabled: !!address && contractAddresses.cUSDC !== zero } })
  const { data: cDAIBalance, refetch: refetchCDAI } = useContractRead({ address: contractAddresses.cDAI as `0x${string}`, abi: tokenAbi, functionName: 'confidentialBalanceOf', args: [address], query: { enabled: !!address && contractAddresses.cDAI !== zero } })

  React.useEffect(() => {
    const balances = [cETHBalance, cBTCBalance, cUSDCBalance, cDAIBalance]
    setTokenBalances(prev => prev.map((t, i) => ({ ...t, encryptedBalance: balances[i] ? String(balances[i]) : zero })))
  }, [cETHBalance, cBTCBalance, cUSDCBalance, cDAIBalance])

  const handleDecrypt = async (tokenSymbol: string) => {
    setTokenBalances(prev => prev.map(t => (t.symbol === tokenSymbol ? { ...t, isDecrypting: true } : t)))
    try {
      const signer = await signerPromise
      if (!relayer) {
        window.alert('加密服务未初始化，请稍后重试或刷新页面。')
        setTokenBalances(prev => prev.map(t => (t.symbol === tokenSymbol ? { ...t, isDecrypting: false } : t)))
        return
      }
      if (!signer) throw new Error('Signer not ready')
      const mapping: Record<string, { handle: string; address: string }> = {
        cETH: { handle: tokenBalances[0].encryptedBalance, address: contractAddresses.cETH },
        cBTC: { handle: tokenBalances[1].encryptedBalance, address: contractAddresses.cBTC },
        cUSDC: { handle: tokenBalances[2].encryptedBalance, address: contractAddresses.cUSDC },
        cDAI: { handle: tokenBalances[3].encryptedBalance, address: contractAddresses.cDAI },
      }
      // Pull latest handle from chain before decrypt
      let latestHandle: string | undefined
      if (tokenSymbol === 'cETH') latestHandle = (await refetchCETH()).data as any
      if (tokenSymbol === 'cBTC') latestHandle = (await refetchCBTC()).data as any
      if (tokenSymbol === 'cUSDC') latestHandle = (await refetchCUSDC()).data as any
      if (tokenSymbol === 'cDAI') latestHandle = (await refetchCDAI()).data as any

      const target = { handle: latestHandle || mapping[tokenSymbol].handle, address: mapping[tokenSymbol].address }
      if (!target || !target.handle || target.address === zero) throw new Error('Invalid token address or handle')

      // If handle is zero, directly show 0
      if (target.handle.toLowerCase() === zero.toLowerCase()) {
        setTokenBalances(prev => prev.map(t => (t.symbol === tokenSymbol ? { ...t, decryptedBalance: `0 ${tokenSymbol}`, isDecrypting: false } : t)))
        return
      }

      const keypair = relayer.generateKeypair()
      const start = Math.floor(Date.now() / 1000).toString()
      const durationDays = '10'
      const eip712 = relayer.createEIP712(keypair.publicKey, [target.address], start, durationDays)
      const signature = await signer.signTypedData(eip712.domain, { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification }, eip712.message)

      const result = await relayer.userDecrypt(
        [{ handle: target.handle, contractAddress: target.address }],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        [target.address],
        signer.address,
        start,
        durationDays,
      )
      const decryptedRaw = result[target.handle]
      let human = '0'
      try {
        const bi = BigInt(String(decryptedRaw))
        human = formatScaled(bi)
      } catch {
        human = String(decryptedRaw)
      }
      setTokenBalances(prev => prev.map(t => (t.symbol === tokenSymbol ? { ...t, decryptedBalance: `${human} ${tokenSymbol}`, isDecrypting: false } : t)))
    } catch (e) {
      console.error(e)
      setTokenBalances(prev => prev.map(t => (t.symbol === tokenSymbol ? { ...t, isDecrypting: false } : t)))
    }
  }

  return (
    <div className="balance-section">
      <div className="card">
        <h2>💰 你的保密代币余额</h2>
        <p style={{ marginBottom: 16, color: '#666' }}>下方展示的是加密余额（bytes32 句柄）。点击解密后在本地显示明文余额。</p>
        <div className="balance-grid">
          {tokenBalances.map(t => (
            <div key={t.symbol} className="balance-card">
              <div className={`token-icon ${t.color}`} style={{ margin: '0 auto 16px' }}>{t.icon}</div>
              <h3>{t.name}</h3>
              {t.decryptedBalance ? (
                <div className="balance-amount">{t.decryptedBalance}</div>
              ) : (
                <>
                  <div className="encrypted-balance">{t.encryptedBalance?.slice(0, 18)}... (Encrypted)</div>
                  <button className="button decrypt-button" onClick={() => handleDecrypt(t.symbol)} disabled={t.isDecrypting}>
                    {t.isDecrypting ? '🔓 解密中...' : '🔍 解密'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'

function formatScaled(v: bigint): string {
  const SCALE = 1_000_000n
  const intPart = v / SCALE
  const fracPart = v % SCALE
  if (fracPart === 0n) return intPart.toString()
  const fracStr = fracPart.toString().padStart(6, '0').replace(/0+$/, '')
  return `${intPart.toString()}.${fracStr}`
}
