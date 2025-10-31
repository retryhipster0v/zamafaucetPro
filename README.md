# PrivyFaucet

**Private token faucet with encrypted claims**

PrivyFaucet enables privacy-preserving token distribution where claim amounts and eligibility remain encrypted during the claiming process. Built on Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM), the platform distributes tokens based on encrypted eligibility checks and claim amounts, revealing only distribution totals—never individual claim details.

---

## What is PrivyFaucet?

PrivyFaucet is a decentralized token faucet that protects user privacy during token claims. Unlike traditional faucets that expose claim amounts and eligibility, PrivyFaucet uses Zama FHEVM to process claims over encrypted data, ensuring that individual claim amounts and eligibility criteria remain private while maintaining verifiable token distribution.

**Core Benefit**: Claim tokens privately without exposing claim amounts or eligibility status to faucet operators or other users.

---

## How PrivyFaucet Works

### Claim Process

**Step 1: Eligibility Check**
- User's eligibility encrypted and checked homomorphically
- Encrypted balance verification (if applicable)
- Encrypted rate limit checking
- Encrypted time window validation

**Step 2: Claim Submission**
- User encrypts desired claim amount (or uses default)
- Encrypted claim submitted to smart contract
- Contract validates eligibility (homomorphic)
- Encrypted claim recorded

**Step 3: Distribution**
- Tokens transferred based on encrypted claim
- Claim amount decrypted only for transfer execution
- Distribution recorded (aggregate totals only)
- User receives tokens

### Privacy Protection

**Encrypted Throughout:**
- Eligibility status encrypted
- Claim amounts encrypted
- Rate limit tracking encrypted
- Balance checks encrypted

**What's Revealed:**
- Token transfers (public on blockchain)
- Aggregate distribution totals (optional)
- Total faucet balance (public)

---

## Faucet Features

### Private Claiming

**Encrypted Claims:**
- Claim amounts encrypted before submission
- Eligibility checked homomorphically
- No exposure of claim amounts
- Anonymous claiming option

### Rate Limiting

**Encrypted Rate Tracking:**
- Claim frequency encrypted
- Time windows encrypted
- Homomorphic rate limit enforcement
- Privacy-preserving throttling

### Eligibility Management

**Encrypted Eligibility:**
- Eligibility criteria encrypted
- Checks performed homomorphically
- No exposure of eligibility status
- Fair distribution guarantees

### Token Distribution

**Secure Distribution:**
- Token transfers executed securely
- Distribution totals tracked
- Verifiable token distribution
- Immutable claim records

---

## Smart Contract Design

### Core Contract

```solidity
contract PrivyFaucet {
    struct EncryptedClaim {
        euint64 amount;              // Encrypted claim amount
        euint32 timestamp;          // Encrypted claim time
        address claimer;            // Public claimer address
        ebool isEligible;           // Encrypted eligibility
    }
    
    euint64 encryptedTotalDistributed;  // Encrypted total
    euint64 encryptedDailyLimit;        // Encrypted daily limit
    euint32 encryptedLastClaimTime;     // Encrypted time tracking
    
    function claimTokens(bytes calldata encryptedClaim) external;
    
    function checkEligibility(bytes calldata encryptedEligibility)
        external
        view
        returns (ebool);
    
    function getTotalDistributed(bytes calldata key)
        external
        returns (uint256);
}
```

### Homomorphic Operations

**Eligibility Verification:**
```solidity
ebool isEligible = TFHE.and(
    TFHE.gt(encryptedBalance, 0),
    TFHE.lt(encryptedTimeSinceLastClaim, cooldownPeriod)
);
```

**Rate Limit Checking:**
```solidity
ebool canClaim = TFHE.and(
    isEligible,
    TFHE.lt(encryptedDailyClaims, encryptedDailyLimit)
);
```

**Claim Processing:**
```solidity
euint64 newTotal = TFHE.add(
    encryptedTotalDistributed,
    encryptedClaimAmount
);
```

---

## Privacy Model

### Individual Privacy

| Data Type | Privacy Level |
|-----------|--------------|
| Claim amounts | Encrypted until distribution |
| Eligibility status | Encrypted during checks |
| Claim frequency | Encrypted tracking |
| Balance information | Encrypted (if applicable) |

### Aggregate Transparency

| Information | Visibility |
|-------------|-----------|
| Total distributed | Public (optional reveal) |
| Faucet balance | Public |
| Token transfers | Public (blockchain) |
| Distribution proofs | Public (verification) |

---

## Use Cases

### Testnet Token Distribution

**Scenario**: Distribute testnet tokens privately  
**Benefit**: Users claim without exposing activity patterns  
**Example**: Sepolia ETH faucet with private claims

### Airdrop Distribution

**Scenario**: Distribute tokens in airdrop campaign  
**Benefit**: Recipients claim privately  
**Example**: Community token airdrop with encrypted claims

### Reward Distribution

**Scenario**: Distribute rewards based on eligibility  
**Benefit**: Eligibility checked privately  
**Example**: Achievement rewards with private eligibility

---

## Getting Started

### Setup

```bash
git clone https://github.com/yourusername/privyfaucet.git
cd privyfaucet
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your settings
```

### Deployment

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### Claim Tokens

1. **Connect Wallet**: Use MetaMask
2. **Check Eligibility**: Verify encrypted eligibility
3. **Encrypt Claim**: Encrypt claim amount
4. **Submit**: Send encrypted claim
5. **Receive**: Tokens transferred to your wallet

---

## API Reference

### Smart Contract Methods

```solidity
// Claim tokens
function claimTokens(bytes calldata encryptedClaim) external;

// Check eligibility
function checkEligibility(bytes calldata encryptedData)
    external
    view
    returns (bytes memory encryptedResult);

// Get distribution total
function getTotalDistributed(bytes calldata key)
    external
    returns (uint256);
```

### JavaScript SDK

```typescript
import { PrivyFaucet } from '@privyfaucet/sdk';

const client = new PrivyFaucet({
  provider: window.ethereum,
  contractAddress: '0x...',
});

// Claim tokens
const encrypted = await client.encryptClaim(amount);
await client.claimTokens(encrypted);

// Check eligibility
const encryptedEligibility = await client.encryptEligibility(data);
const result = await client.checkEligibility(encryptedEligibility);
```

---

## Performance

### Gas Costs

| Operation | Gas | Notes |
|-----------|-----|-------|
| Claim tokens | ~150,000 | Per claim |
| Check eligibility | ~100,000 | Read operation |
| Update totals | ~80,000 | Distribution tracking |

---

## Roadmap

### Q1 2025
- ✅ Core faucet functionality
- ✅ Encrypted claims
- ✅ Eligibility checking
- 🔄 Performance optimization

### Q2 2025
- 📋 Advanced rate limiting
- 📋 Multi-token support
- 📋 Mobile application
- 📋 Analytics dashboard

### Q3 2025
- 📋 Cross-chain support
- 📋 Enterprise features
- 📋 API improvements
- 📋 Governance tools

### Q4 2025
- 📋 Zero-knowledge enhancements
- 📋 Decentralized management
- 📋 Advanced eligibility
- 📋 Post-quantum FHE support

---

## Contributing

We welcome contributions! Priority areas:

- FHE optimization
- Gas cost reduction
- Security audits
- UI/UX improvements
- Documentation

**How to contribute:**
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

PrivyFaucet is built on:

- **[Zama FHEVM](https://www.zama.ai/fhevm)**: Fully Homomorphic Encryption Virtual Machine
- **[Zama](https://www.zama.ai/)**: FHE research and development
- **Ethereum Foundation**: Blockchain infrastructure

Built with support from the privacy-preserving development community.

---

## Links

- **Repository**: [GitHub](https://github.com/yourusername/privyfaucet)
- **Documentation**: [Full Docs](https://docs.privyfaucet.io)
- **Discord**: [Community](https://discord.gg/privyfaucet)
- **Twitter**: [@PrivyFaucet](https://twitter.com/privyfaucet)

---

**PrivyFaucet** - Claim tokens privately, distribute transparently.

_Powered by Zama FHEVM_

