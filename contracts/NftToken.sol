// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

// contract BasicNft is Ownable, ERC721 {
contract NftToken is Ownable, ERC721 {
  uint256 public s_tokenCounter;
  string private s_baseURIextended;
  using Strings for uint256;
  mapping(uint256 => string) private s_metadataURIs;

  string private _baseURIextended;
  uint256 public fee = (1 * 10**16);

  constructor() ERC721('Simple', 'SIMPLE') {
    s_tokenCounter = 0;
  }

  // string public constant TOKEN_URI =
  //     "https://ipfs.io/ipfs/QmTQrDqP4poPe4drjZKFzDqNcfmAHzC1qN3JEpJZjGL4Q8";

  function setBaseURI(string memory baseURI_) external onlyOwner {
    _baseURIextended = baseURI_;
  }

  function getBaseURI() public view returns (string memory) {
    return _baseURIextended;
  }

  function _setTokenURI(uint256 tokenId, string memory _metadataURI)
    public
    virtual
  {
    require(_exists(tokenId), 'ERC721Metadata: URI set of nonexistent token');
    require(
      bytes(_metadataURI).length > 0,
      'ERC721Metadata: metadata URI is require'
    );
    s_metadataURIs[tokenId] = _metadataURI;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(tokenId),
      'ERC721Metadata: URI query for nonexistent token'
    );

    string memory _metadataURI = s_metadataURIs[tokenId];
    string memory base = getBaseURI();

    if (bytes(base).length == 0) {
      return _metadataURI;
    }

    if (bytes(_metadataURI).length > 0) {
      return string(abi.encodePacked(base, _metadataURI));
    }
  }

  function mintItem(string memory metadataURI)
    public
    payable
    returns (uint256)
  {
    require(msg.value >= fee, 'NftToken: Value is less then fee');
    s_tokenCounter = s_tokenCounter + 1;
    _safeMint(msg.sender, s_tokenCounter);
    _setTokenURI(s_tokenCounter, metadataURI);
    return s_tokenCounter;
  }

  function approve(address to, uint256 tokenId) public override {
    require(
      (ownerOf(tokenId) == msg.sender) || (getApproved(tokenId) == msg.sender),
      'ERC721Metadata: caller is not token owner or approved'
    );
    _approve(to, tokenId);
  }

  function burn(uint256 tokenId) public virtual {
    //solhint-disable-next-line max-line-length
    require(
      _isApprovedOrOwner(_msgSender(), tokenId),
      'ERC721: caller is not token owner nor approved'
    );
    _burn(tokenId);
  }

  function balanceOfContract() public view returns (uint256) {
    return address(this).balance;
  }

  function withdraw(address to) public payable onlyOwner {
    payable(to).call{ value: address(this).balance }('');
  }
}
