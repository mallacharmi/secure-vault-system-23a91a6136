# Secure Vault System

## Overview

This project implements a secure two-contract vault system where
fund withdrawals are permitted **only after explicit on-chain
authorization validation**.

The system separates responsibility between:

- Asset custody (Vault)
- Permission validation (Authorization Manager)

This mirrors real-world decentralized architectures that split trust
boundaries to reduce risk and improve security.

---

## System Architecture

The system consists of two smart contracts:

### SecureVault

- Holds native blockchain currency (ETH)
- Accepts deposits from any address
- Executes withdrawals only after authorization approval
- Does **not** perform cryptographic signature verification

### AuthorizationManager

- Validates withdrawal permissions
- Verifies off-chain generated authorizations
- Tracks authorization usage
- Prevents replay attacks

The Vault relies **exclusively** on the AuthorizationManager for permission checks.

---

## Authorization Design

Withdrawal permissions are generated **off-chain** and validated **on-chain**.

Each authorization is deterministically bound to:

- Vault contract address
- Blockchain network (chain ID)
- Recipient address
- Withdrawal amount
- Unique authorization identifier (nonce)
- Cryptographic signature

This binding prevents misuse across different vaults, networks,
recipients, or amounts.

---

## Replay Protection

Replay protection is enforced by the AuthorizationManager:

- Each authorization contains a unique identifier
- Once used successfully, it is marked as **consumed**
- Any attempt to reuse the same authorization **reverts**

This guarantees:

- Exactly-once execution
- No duplicated withdrawals
- Deterministic failure on replay attempts

---

## State Safety Guarantees

The system enforces the following invariants:

- Vault balance never becomes negative
- State updates occur **before** value transfer
- Unauthorized callers cannot trigger privileged actions
- Initialization logic executes only once
- Cross-contract interactions cannot cause duplicated effects

---

## Events & Observability

The system emits events for:

- Deposits
- Authorization consumption
- Successful withdrawals

Failed withdrawal attempts revert deterministically without partial state changes.

---

## Local Deployment (Dockerized)

### Prerequisites

- Docker
- Docker Compose

### Run the system

```bash
docker-compose up --build
```

This will:

- Start a local Ganache blockchain
- Deploy AuthorizationManager
- Deploy SecureVault with AuthorizationManager address
- Expose RPC at `http://localhost:8545`
- Output deployed contract addresses to logs

No manual steps are required.

---

## Testing & Validation

Automated tests demonstrate:

- Deposits are accepted
- Authorized withdrawals succeed exactly once
- Invalid or replayed authorizations are rejected

Run tests locally:

```bash
npx hardhat test
```

---

## Assumptions & Limitations

- Authorization signing keys are assumed to be securely managed off-chain
- The system uses a local development blockchain for evaluation
- No frontend is included; interaction is programmatic

---

## Conclusion

This project demonstrates secure multi-contract design, strict
authorization enforcement, replay protection, and deterministic behavior
under adversarial conditions using production-grade Web3 practices.
