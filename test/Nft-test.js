const { expect, assert } = require('chai');
const { ethers } = require('hardhat');

describe('NftToken', function () {
  let nftContract;
  let contract;
  let deployer;
  let user1;
  let user2;
  const fee = ethers.utils.parseEther('0.01');

  this.beforeEach(async function () {
    nftContract = await ethers.getContractFactory('NftToken');
    [deployer, user1, user2] = await ethers.getSigners();
    contract = await nftContract.deploy();
  });

  describe('Base URL', function () {
    it('Base __baseURIextended URL', async function () {
      const startBaseUrl = await contract.getBaseURI();
      assert.equal(startBaseUrl, '');
    });

    it('Set __baseURIextended URL', async function () {
      await contract.setBaseURI('https://ipfs.io/');
      const baseUrl = await contract.getBaseURI();

      assert.equal(baseUrl, 'https://ipfs.io/');
    });
  });

  describe('Mint NFT', function () {
    it('Mint without value', async function () {
      await expect(contract.mintItem('John')).to.be.revertedWith(
        'NftToken: Value is less then fee'
      );
    });

    it('Mint without less value', async function () {
      await expect(
        contract.mintItem('John', { value: ethers.utils.parseEther('0.001') })
      ).to.be.revertedWith('NftToken: Value is less then fee');
    });

    it('Is counter increases', async function () {
      await contract.connect(deployer);
      const currentCounter = await contract.s_tokenCounter();
      const balanceOfTokenBefore = await contract.balanceOf(deployer.address);
      await contract.mintItem('John', { value: fee });
      const counterAfterMint = await contract.s_tokenCounter();
      const balanceOfTokenAfter = await contract.balanceOf(deployer.address);

      assert.equal(
        Number(currentCounter.toString()) + 1,
        counterAfterMint.toString()
      );
      assert.equal(
        Number(balanceOfTokenBefore.toString()) + 1,
        balanceOfTokenAfter.toString()
      );
    });

    it('Does user take the tokenURI', async function () {
      await contract.connect(deployer);
      await contract.setBaseURI('https://ipfs.io/');
      await contract.mintItem('John', { value: fee });
      const tokenID = await contract.s_tokenCounter();
      const URL = await contract.tokenURI(Number(tokenID.toString()));

      assert.equal(URL, 'https://ipfs.io/John');
    });
  });

  describe('Approve NFT to another address', function () {
    it('Approve address', async function () {
      await contract.connect(deployer);
      await contract.mintItem('John', { value: fee });
      await contract.approve(user1.address, 1);
      const tokenID = await contract.s_tokenCounter();

      const approveAddress = await contract.getApproved(
        Number(tokenID.toString())
      );

      assert.equal(approveAddress, user1.address);
    });

    it('Do not approve to incorrect address', async function () {
      await contract.connect(deployer);
      await contract.mintItem('John', { value: fee });
      const connectUser1 = await contract.connect(user1);

      await expect(connectUser1.approve(user2.address, 1)).to.be.revertedWith(
        'ERC721: approve caller is not token owner nor approved for all'
      );
    });
  });

  describe('Burn NFT', function () {
    it('Burn with incorrect address', async function () {
      await contract.connect(deployer);
      await contract.mintItem('John', { value: fee });
      const connectUser1 = await contract.connect(user1);

      await expect(connectUser1.burn(1)).to.be.revertedWith(
        'ERC721: caller is not token owner nor approved'
      );
    });

    it('Burn with already burned tokenID ', async function () {
      await contract.connect(deployer);
      await contract.mintItem('John', { value: fee });
      await contract.burn(1);

      const ownerOfTokenId = await contract.s_metadataURIs(1);

      assert.equal(ownerOfTokenId, '');

      await expect(contract.burn(1)).to.be.revertedWith(
        'ERC721: invalid token ID'
      );
    });
  });
});
