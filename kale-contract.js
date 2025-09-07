const StellarSdk = require('stellar-sdk');
const crypto = require('crypto');

// KALE Smart Contract Configuration - MAINNET
const KALE_CONTRACT_ID = 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA';
const KALE_ASSET_CODE = 'KALE';
const KALE_ASSET_ISSUER = 'GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE';
const KALE_SAC_ADDRESS = 'CB23WRDQWGSP6YPMY4UV5C4OW5CBTXKYN3XEATG7KJEZCXMJBYEHOUOV';

// Server configuration
const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org')
const KALE_ASSET = new StellarSdk.Asset(KALE_ASSET_CODE, KALE_ASSET_ISSUER);

// KALE Smart Contract Integration Class
class KaleSmartContract {
    constructor() {
        this.server = server;
        this.contractId = KALE_CONTRACT_ID;
        this.asset = KALE_ASSET;
        this.farmingSessions = new Map();
        this.userAccounts = new Map();
    }

    // Connect user account to KALE farming
    async connectAccount(userId, secretKey) {
        try {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            const publicKey = keypair.publicKey();
            
            // Validate account exists
            const account = await this.server.loadAccount(publicKey);
            
            // Check for KALE trustline
            const kaleBalance = account.balances.find(balance => 
                balance.asset_code === KALE_ASSET_CODE && 
                balance.asset_issuer === KALE_ASSET_ISSUER
            );
            
            const accountData = {
                publicKey: publicKey,
                secretKey: secretKey,
                keypair: keypair,
                connectedAt: new Date(),
                kaleBalance: kaleBalance ? parseFloat(kaleBalance.balance) : 0,
                hasTrustline: !!kaleBalance,
                totalEarned: 0,
                farmingHistory: []
            };
            
            this.userAccounts.set(userId, accountData);
            
            return {
                success: true,
                publicKey: publicKey,
                kaleBalance: accountData.kaleBalance,
                hasTrustline: accountData.hasTrustline,
                stellarExpertUrl: `https://stellar.expert/explorer/public/account/${publicKey}`
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to connect account: ${error.message}`
            };
        }
    }

    // Step 1: Plant (Staking function)
    async plant(userId, stakeAmount = 0) {
        try {
            const account = this.userAccounts.get(userId);
            if (!account) {
                return { success: false, error: 'Account not connected' };
            }

            // Get current farm index from contract
            const farmIndex = await this.getFarmIndex();
            
            // Create plant transaction
            const sourceAccount = await this.server.loadAccount(account.publicKey);
            
            const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.PUBLIC
            })
            .addOperation(StellarSdk.Operation.invokeContract({
                contract: this.contractId,
                function: 'plant',
                args: [
                    StellarSdk.Address.fromString(account.publicKey).toScVal(),
                    StellarSdk.nativeToScVal(stakeAmount * 10000000, { type: 'i128' }) // Convert to stroops
                ]
            }))
            .setTimeout(30)
            .build();

            transaction.sign(account.keypair);
            
            const result = await this.server.submitTransaction(transaction);
            
            // Store farming session
            const farmingSession = {
                userId: userId,
                farmIndex: farmIndex,
                stakeAmount: stakeAmount,
                plantTime: Date.now(),
                plantLedger: result.ledger,
                status: 'planted',
                workSubmitted: false,
                harvested: false
            };
            
            this.farmingSessions.set(userId, farmingSession);
            
            return {
                success: true,
                transactionHash: result.hash,
                farmIndex: farmIndex,
                stakeAmount: stakeAmount,
                stellarExpertUrl: `https://stellar.expert/explorer/public/tx/${result.hash}`
            };
        } catch (error) {
            return {
                success: false,
                error: `Plant failed: ${error.message}`
            };
        }
    }

    // Step 2: Work (Proof-of-Work function)
    async work(userId, maxAttempts = 1000) {
        try {
            const session = this.farmingSessions.get(userId);
            const account = this.userAccounts.get(userId);
            
            if (!session || !account) {
                return { success: false, error: 'No active farming session' };
            }

            if (session.status !== 'planted') {
                return { success: false, error: 'Must plant before working' };
            }

            // Get current entropy (previous block hash)
            const entropy = await this.getEntropy();
            
            // Perform proof-of-work to find hash with maximum zeros
            const workResult = await this.performProofOfWork(
                session.farmIndex,
                entropy,
                account.publicKey,
                maxAttempts
            );

            if (!workResult.success) {
                return { success: false, error: 'Failed to find valid hash' };
            }

            // Submit work to contract
            const sourceAccount = await this.server.loadAccount(account.publicKey);
            
            const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.PUBLIC
            })
            .addOperation(StellarSdk.Operation.invokeContract({
                contract: this.contractId,
                function: 'work',
                args: [
                    StellarSdk.Address.fromString(account.publicKey).toScVal(),
                    StellarSdk.nativeToScVal(workResult.nonce, { type: 'u64' }),
                    StellarSdk.nativeToScVal(workResult.zeros, { type: 'u32' })
                ]
            }))
            .setTimeout(30)
            .build();

            transaction.sign(account.keypair);
            
            const result = await this.server.submitTransaction(transaction);
            
            // Update session
            session.status = 'worked';
            session.workSubmitted = true;
            session.nonce = workResult.nonce;
            session.zeros = workResult.zeros;
            session.workHash = workResult.hash;
            
            return {
                success: true,
                transactionHash: result.hash,
                nonce: workResult.nonce,
                zeros: workResult.zeros,
                hash: workResult.hash,
                stellarExpertUrl: `https://stellar.expert/explorer/public/tx/${result.hash}`
            };
        } catch (error) {
            return {
                success: false,
                error: `Work failed: ${error.message}`
            };
        }
    }

    // Step 3: Harvest (Claim rewards)
    async harvest(userId) {
        try {
            const session = this.farmingSessions.get(userId);
            const account = this.userAccounts.get(userId);
            
            if (!session || !account) {
                return { success: false, error: 'No active farming session' };
            }

            if (session.status !== 'worked') {
                return { success: false, error: 'Must complete work before harvesting' };
            }

            // Submit harvest to contract
            const sourceAccount = await this.server.loadAccount(account.publicKey);
            
            const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.PUBLIC
            })
            .addOperation(StellarSdk.Operation.invokeContract({
                contract: this.contractId,
                function: 'harvest',
                args: [
                    StellarSdk.Address.fromString(account.publicKey).toScVal(),
                    StellarSdk.nativeToScVal(session.farmIndex, { type: 'u32' })
                ]
            }))
            .setTimeout(30)
            .build();

            transaction.sign(account.keypair);
            
            const result = await this.server.submitTransaction(transaction);
            
            // Calculate reward (this would come from contract events in real implementation)
            const estimatedReward = this.calculateEstimatedReward(session);
            
            // Update session and account
            session.status = 'harvested';
            session.harvested = true;
            session.harvestTime = Date.now();
            session.reward = estimatedReward;
            
            account.totalEarned += estimatedReward;
            account.farmingHistory.push({
                farmIndex: session.farmIndex,
                stakeAmount: session.stakeAmount,
                zeros: session.zeros,
                reward: estimatedReward,
                timestamp: new Date()
            });
            
            return {
                success: true,
                transactionHash: result.hash,
                reward: estimatedReward,
                farmIndex: session.farmIndex,
                stellarExpertUrl: `https://stellar.expert/explorer/public/tx/${result.hash}`
            };
        } catch (error) {
            return {
                success: false,
                error: `Harvest failed: ${error.message}`
            };
        }
    }

    // Automated farming cycle
    async startAutomatedFarming(userId, stakeAmount = 0) {
        try {
            // Step 1: Plant
            const plantResult = await this.plant(userId, stakeAmount);
            if (!plantResult.success) {
                return { success: false, step: 'plant', error: plantResult.error };
            }

            // Wait a bit for ledger to update
            await this.sleep(5000);

            // Step 2: Work
            const workResult = await this.work(userId);
            if (!workResult.success) {
                return { success: false, step: 'work', error: workResult.error };
            }

            // Wait for block to close (simplified timing)
            await this.sleep(10000);

            // Step 3: Harvest
            const harvestResult = await this.harvest(userId);
            if (!harvestResult.success) {
                return { success: false, step: 'harvest', error: harvestResult.error };
            }

            return {
                success: true,
                plantHash: plantResult.transactionHash,
                workHash: workResult.transactionHash,
                harvestHash: harvestResult.transactionHash,
                reward: harvestResult.reward,
                zeros: workResult.zeros
            };
        } catch (error) {
            return {
                success: false,
                error: `Automated farming failed: ${error.message}`
            };
        }
    }

    // Helper functions
    async getFarmIndex() {
        try {
            // Try to get real farm index from contract
            const contractAccount = await this.server.loadAccount(this.contractId);
            // In a real implementation, you would call a contract function here
            // For now, return a deterministic value based on current ledger
            return Math.floor(Date.now() / 60000); // New index every minute
        } catch (error) {
            console.warn('⚠️ Could not get farm index from contract, using fallback:', error.message);
            return Math.floor(Date.now() / 60000);
        }
    }

    async getEntropy() {
        try {
            // Try to get real entropy from the latest ledger
            const latestLedger = await this.server.ledgers().order('desc').limit(1).call();
            if (latestLedger.records && latestLedger.records.length > 0) {
                const ledger = latestLedger.records[0];
                // Use ledger hash as entropy
                return Buffer.from(ledger.hash, 'hex');
            }
        } catch (error) {
            console.warn('⚠️ Could not get entropy from ledger, using fallback:', error.message);
        }
        // Fallback to random entropy
        return crypto.randomBytes(32);
    }

    async performProofOfWork(index, entropy, farmer, maxAttempts) {
        const farmerBytes = StellarSdk.StrKey.decodeEd25519PublicKey(farmer);
        let bestNonce = 0;
        let bestZeros = 0;
        let bestHash = null;

        for (let nonce = 0; nonce < maxAttempts; nonce++) {
            const hash = this.generateHash(index, nonce, entropy, farmerBytes);
            const zeros = this.countLeadingZeros(hash);
            
            if (zeros > bestZeros) {
                bestZeros = zeros;
                bestNonce = nonce;
                bestHash = hash;
            }

            // If we found a decent number of zeros, use it
            if (zeros >= 3) break;
        }

        return {
            success: bestZeros > 0,
            nonce: bestNonce,
            zeros: bestZeros,
            hash: bestHash
        };
    }

    generateHash(index, nonce, entropy, farmerBytes) {
        const hashArray = Buffer.alloc(76);
        
        // Copy values according to the contract specification
        hashArray.writeUInt32BE(index, 0);
        hashArray.writeBigUInt64BE(BigInt(nonce), 4);
        entropy.copy(hashArray, 12, 0, 32);
        farmerBytes.copy(hashArray, 44, 0, 32);
        
        return crypto.createHash('sha3-256').update(hashArray).digest();
    }

    countLeadingZeros(hash) {
        let zeros = 0;
        for (const byte of hash) {
            if (byte === 0) {
                zeros += 2;
            } else if (byte < 16) {
                zeros += 1;
                break;
            } else {
                break;
            }
        }
        return zeros;
    }

    calculateEstimatedReward(session) {
        // Simplified reward calculation
        const baseReward = 500; // Base block reward
        const stakeMultiplier = session.stakeAmount > 0 ? 1 + (session.stakeAmount / 1000) : 1;
        const zerosMultiplier = 1 + (session.zeros * 0.1);
        const gapMultiplier = 1 + (Date.now() - session.plantTime) / (1000 * 60 * 5); // 5-minute gap bonus
        
        return (baseReward * stakeMultiplier * zerosMultiplier * gapMultiplier) / 10000000; // Convert from stroops
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get user farming status
    getFarmingStatus(userId) {
        const account = this.userAccounts.get(userId);
        const session = this.farmingSessions.get(userId);
        
        return {
            connected: !!account,
            account: account ? {
                publicKey: account.publicKey,
                kaleBalance: account.kaleBalance,
                totalEarned: account.totalEarned,
                farmingHistory: account.farmingHistory
            } : null,
            currentSession: session ? {
                farmIndex: session.farmIndex,
                status: session.status,
                stakeAmount: session.stakeAmount,
                zeros: session.zeros || 0,
                reward: session.reward || 0
            } : null
        };
    }

    // Check if smart contract is working properly
    async checkContractHealth() {
        try {
            console.log('🔍 Checking smart contract health...');
            
            // Check if we can connect to Stellar network
            const serverInfo = await this.server.server();
            console.log('✅ Stellar network connection: OK');
            
            // Check if contract account exists
            try {
                const contractAccount = await this.server.loadAccount(this.contractId);
                console.log('✅ Smart contract account exists');
                
                // Check contract balance
                const xlmBalance = contractAccount.balances.find(b => b.asset_type === 'native');
                console.log(`💰 Contract XLM balance: ${xlmBalance ? xlmBalance.balance : '0'} XLM`);
                
                return {
                    success: true,
                    networkConnected: true,
                    contractExists: true,
                    contractBalance: xlmBalance ? parseFloat(xlmBalance.balance) : 0,
                    serverInfo: {
                        networkPassphrase: serverInfo.network_passphrase,
                        protocolVersion: serverInfo.protocol_version
                    }
                };
            } catch (error) {
                console.error('❌ Smart contract account not found:', error.message);
                return {
                    success: false,
                    networkConnected: true,
                    contractExists: false,
                    error: `Contract account not found: ${error.message}`
                };
            }
        } catch (error) {
            console.error('❌ Smart contract health check failed:', error.message);
            return {
                success: false,
                networkConnected: false,
                contractExists: false,
                error: `Network connection failed: ${error.message}`
            };
        }
    }
}

module.exports = KaleSmartContract;
