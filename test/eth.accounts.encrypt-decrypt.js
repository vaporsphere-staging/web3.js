import _ from 'lodash';
import { assert } from 'chai';
import ethereumWallet from 'ethereumjs-wallet';
import Accounts from './../packages/web3-eth-accounts/src/index.js';
import Web3 from '../packages/web3';

const web3 = new Web3();

const n = 256;
const salt = '3a1012583f8be138537bc7cf8a50c925b6fcc01a9f7744c85a18fbdc07999f10';
const iv = Buffer.from('653195c3e2791ac53f3f19b125c18f8c', 'hex');
const uuid = Buffer.from('ff31ddc3e2791ac53f3f19b125c18fff', 'hex');
const pw = 'test';

// tests from https://github.com/Gustav-Simonsson/go-ethereum/blob/7cc6b801e0967e5ebfa26b9f670675acea6e3a20/accounts/testdata/v3_test_vector.json
const staticTests = [{
    json: {
        crypto: {
            cipher: 'aes-128-ctr',
            cipherparams: {
                iv: '83dbcc02d8ccb40e466191a123791e0e'
            },
            ciphertext: 'd172bf743a674da9cdad04534d56926ef8358534d458fffccd4e6ad2fbde479c',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                n: 262144,
                r: 1,
                p: 8,
                salt: 'ab0c7876052600dd703518d6fc3fe8984592145b591fc8fb5c6d43190334ba19'
            },
            mac: '2103ac29920d71da29f15d75b4a16dbe95cfd7ff8faea1056c33131d846e3097'
        },
        id: '3198bc9c-6672-5ab3-d995-4942343ae5b6',
        version: 3
    },
    password: 'testpassword',
    priv: '7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d'
}, {
    json: {
        crypto: {
            cipher: 'aes-128-ctr',
            cipherparams: {
                iv: '6087dab2f9fdbbfaddc31a909735c1e6'
            },
            ciphertext: '5318b4d5bcd28de64ee5559e671353e16f075ecae9f99c7a79a38af5f869aa46',
            kdf: 'pbkdf2',
            kdfparams: {
                c: 262144,
                dklen: 32,
                prf: 'hmac-sha256',
                salt: 'ae3cd4e7013836a3df6bd7241b12db061dbe2c6785853cce422d148a624ce0bd'
            },
            mac: '517ead924a9d0dc3124507e3393d175ce3ff7c1e96529c6c555ce9e51205e9b2'
        },
        id: '3198bc9c-6672-5ab3-d995-4942343ae5b6',
        version: 3
    },
    password: 'testpassword',
    priv: '7a28b5ba57c53603b0b07b56bba752f7784bf506fa95edc395f5cf6c7514fe9d'
}, {
    json: {
        crypto: {
            cipher: 'aes-128-ctr',
            cipherparams: {
                iv: 'e0c41130a323adc1446fc82f724bca2f'
            },
            ciphertext: '9517cd5bdbe69076f9bf5057248c6c050141e970efa36ce53692d5d59a3984',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                n: 2,
                r: 8,
                p: 1,
                salt: '711f816911c92d649fb4c84b047915679933555030b3552c1212609b38208c63'
            },
            mac: 'd5e116151c6aa71470e67a7d42c9620c75c4d23229847dcc127794f0732b0db5'
        },
        id: 'fecfc4ce-e956-48fd-953b-30f8b52ed66c',
        version: 3
    },
    password: 'foo',
    priv: 'fa7b3db73dc7dfdf8c5fbdb796d741e4488628c41fc4febd9160a866ba0f35'
}, {
    json: {
        crypto: {
            cipher: 'aes-128-ctr',
            cipherparams: {
                iv: '3ca92af36ad7c2cd92454c59cea5ef00'
            },
            ciphertext: '108b7d34f3442fc26ab1ab90ca91476ba6bfa8c00975a49ef9051dc675aa',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                n: 2,
                r: 8,
                p: 1,
                salt: 'd0769e608fb86cda848065642a9c6fa046845c928175662b8e356c77f914cd3b'
            },
            mac: '75d0e6759f7b3cefa319c3be41680ab6beea7d8328653474bd06706d4cc67420'
        },
        id: 'a37e1559-5955-450d-8075-7b8931b392b2',
        version: 3
    },
    password: 'foo',
    priv: '81c29e8142bb6a81bef5a92bda7a8328a5c85bb2f9542e76f9b0f94fc018'
}];

describe('eth', () => {
    describe('accounts', () => {
        _.times(50, () => {
            it('encrypt eth.account, and compare to ethereumjs-wallet', () => {
                const ethAccounts = new Accounts();

                // create account
                const acc = ethAccounts.create();

                // create ethereumjs-wallet account
                const ethWall = ethereumWallet.fromPrivateKey(Buffer.from(acc.privateKey.replace('0x', ''), 'hex'));

                // compare addresses
                assert.equal(acc.address, ethWall.getChecksumAddressString());

                assert.deepEqual(acc.encrypt(pw, {
                    n, salt, iv, uuid
                }), ethWall.toV3(pw, {
                    n, salt, iv, uuid
                }));
            });

            it('encrypt eth.account, and decrypt with ethereumjs-wallet', () => {
                const ethAccounts = new Accounts();

                // create account
                const acc = ethAccounts.create();
                const encrypt = acc.encrypt(pw, { n });

                // create ethereumjs-wallet account
                const ethWall = ethereumWallet.fromV3(encrypt, pw);

                // compare addresses
                assert.equal(acc.address, ethWall.getChecksumAddressString());
            });

            it('encrypt ethereumjs-wallet, and decrypt with eth.account', () => {
                const ethAccounts = new Accounts();

                // create account
                const ethWall = ethereumWallet.generate();
                const encrypt = ethWall.toV3(pw, { n });

                // create ethereumjs-wallet account
                const acc = ethAccounts.decrypt(encrypt, pw);

                // compare addresses
                assert.equal(acc.address, ethWall.getChecksumAddressString());
            });

            it('decrypt static signature using ethereumjs-wallet and eth.account and compare', () => {
                const ethAccounts = new Accounts();

                const encrypt = {
                    version: 3,
                    id: '6dac4ae5-7604-498e-a2a2-e86cfb289d0c',
                    address: '143f8913e0417997304fc179b531ff4cb9cab582',
                    crypto:
                        {
                            ciphertext: '8b20d7797fee1c36ec2fff176e1778170745794ad2f124862f7f4bfc028daa27',
                            cipherparams: { iv: 'c6170befc885c940e0d0553f3ba01c6a' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams:
                                {
                                    dklen: 32,
                                    salt: 'd78584e30aaf56781b4432116b1de9b1560b3ca6f4624624c14fb6e6d5638a48',
                                    n: 256,
                                    r: 8,
                                    p: 1
                                },
                            mac: '23d4497c779a6bc421f5cc54358309228389597f594448c5c900ad747f97401b'
                        }
                };

                const acc = ethAccounts.decrypt(encrypt, pw);
                const ethWall = ethereumWallet.fromV3(encrypt, 'test');

                // compare addresses
                assert.equal(acc.address, ethWall.getChecksumAddressString());
                assert.equal(web3.utils.toChecksumAddress('0x143f8913e0417997304fc179b531ff4cb9cab582'), acc.address);
            });
        });

        staticTests.forEach((test) => {
            it('decrypt staticTests and compare to private key', () => {
                const ethAccounts = new Accounts();

                // create account
                const acc = ethAccounts.decrypt(test.json, test.password);

                // compare addresses
                assert.equal(acc.privateKey, `0x${test.priv}`);
            });
        });
    });
});
