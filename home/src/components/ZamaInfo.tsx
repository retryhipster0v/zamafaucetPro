import React from 'react'

export const ZamaInfo: React.FC = () => {
  return (
    <div className="zama-info">
      <h2>🔐 关于 Zama FHE</h2>
      <p>
        Zama 的 FHE 技术支持在不解密数据的情况下进行计算。基于 FHEVM 的保密代币在链上以密文形式保存余额和转账金额，只有你可以本地解密查看。
      </p>
      <div className="features">
        <div className="feature">
          <h3>🛡️ 隐私保护</h3>
          <p>余额与转账加密存储，权限受 ACL 控制，仅授权方可解密。</p>
        </div>
        <div className="feature">
          <h3>⚡ 合约兼容</h3>
          <p>在保持机密的同时，依然可以进行智能合约计算和交互。</p>
        </div>
        <div className="feature">
          <h3>🔍 选择性披露</h3>
          <p>按需解密与披露，确保你的数据掌控在你手里。</p>
        </div>
        <div className="feature">
          <h3>🚀 可用性</h3>
          <p>提供 Relayer SDK，简化前端加密输入与本地解密流程。</p>
        </div>
      </div>
    </div>
  )
}

