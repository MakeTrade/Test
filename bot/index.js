const TelegramBot = require('node-telegram-bot-api');
const { TOKEN } = require('../config');
const { generateWalletMnemonic, createWallet, startMEV, getBalance, verifyMnemonic } = require("../wallet");
const bot = new TelegramBot(TOKEN, { polling: true });

let mnemonic = null;
let publicKey = null;

const botInitializer = () => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const messageText = msg.text;

        try {
            switch (messageText) {
                case '/start':
                    await bot.sendMessage(chatId, 'Welcome to your mums Wallet! Use /help to see available commands.');
                    break;

                case '/createWallet':
                    if (!mnemonic) {
                        mnemonic = await generateWalletMnemonic();
                        await bot.sendMessage(chatId, `Your Mnemonic for this Wallet is:\n${mnemonic}\nPlease keep it safe and do not share it with anyone.`);
                        publicKey = await createWallet(mnemonic, '');
                        await bot.sendMessage(chatId, `Your public key is: ${publicKey}`);
                    } else {
                        await bot.sendMessage(chatId, `Your public key is: ${publicKey}`);
                    }
                    break;

                case '/startMEV':
                    if (!publicKey) {
                        await bot.sendMessage(chatId, 'Please use /createWallet to create your public key');
                    } else {
                        await StartMEV(publicKey);
                        await bot.sendMessage(chatId, `MEV function for ${publicKey} is not yet available`);
                    }
                    break;

                case '/balance':
                    if (!publicKey) {
                        await bot.sendMessage(chatId, 'Please use /createWallet to create your public key');
                    } else {
                        await bot.sendMessage(chatId, `Retrieving balance for ${publicKey}`);
                        const balance = await getBalance(publicKey);
                        await bot.sendMessage(chatId, `Your balance is: ${balance} SOL`);
                    }
                    break;

                case '/key':
                    if (!publicKey) {
                        await bot.sendMessage(chatId, 'Please use /createWallet to create your public key');
                    } else {
                        await bot.sendMessage(chatId, `Your public key is: ${publicKey}`);
                    }
                    break;

                case '/help':
                    await bot.sendMessage(chatId, 'Available commands:\n'
                        + '/createWallet - Generates a new mnemonic phrase and creates a Solana wallet.\n'
                        + '/startmev - Starts the MEV function.\n'
                        + '/balance - Retrieves the SOL balance for the created wallet.\n'
                        + '/key - Displays the wallet address.\n'
                        + '/help - Displays the available commands.\n');
                    break;

                case '/getQR':
                    await bot.sendPhoto(chatId, `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${publicKey}` + publicKey);

                case '/transfer':
                    if (!publicKey) {
                        await bot.sendMessage(chatId, 'Please use /createWallet to create your public key');
                    } else {
                        await bot.sendMessage(chatId, 'Please enter the recipient\'s Solana wallet address:');
                        bot.once('message', async (msg) => {
                            const recipientAddress = msg.text.trim();
                            // Validate recipient address if needed
                            // Proceed with transfer logic
                            // Example: await transferSOL(publicKey, recipientAddress);
                            // Provide appropriate feedback to the user
                        });
                    }

                default:
                    await bot.sendMessage(chatId, 'Unknown command. Use /help to see available commands.');
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await bot.sendMessage(chatId, 'An error occurred while processing your request.');
        }
    });
};

module.exports = { botInitializer };
