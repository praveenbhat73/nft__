import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
// import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressABI } from './constants';

// const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
// const projectSecret = '05vPJAJTkGi3fD5P87sU+KNbpRpuiAfrh4hTURsGHgvTl+d+Djwiag';
// const ipfsHost = 'https://ipfs.infra.io:5001/api/v0';
// const basicAuth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;

// const client = ipfsHttpClient('https://api.pinata.cloud/pinning/pinFileToIPFS');

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask extension...');
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask extension...');
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
    window.location.reload();
  };

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: '98208d68c680be94222f',
          pinata_secret_api_key: '8faa55007358ebf9523d6c4190c1d7fd7be91d31ce8c45cfa1e2e2e8b5840eb0',
        },
      });
      const ipfsHash = response.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      return url;
    } catch (error) {
      console.error('Error uploading file to Pinata. Details: ', error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = (!isReselling)
      ? await contract.createToken(url, price, { value: listingPrice.toString() })
      : await contract.resellToken(id, price, { value: listingPrice.toString() });
    setIsLoadingNFT(true);
    await transaction.wait();
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    console.log(name);
    console.log(description);
    console.log(price);
    console.log(fileUrl);
    if (!name || !description || !price || !fileUrl) {
      return;
    }
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: '98208d68c680be94222f',
          pinata_secret_api_key: '8faa55007358ebf9523d6c4190c1d7fd7be91d31ce8c45cfa1e2e2e8b5840eb0',
        },
      });
      const ipfsHash = response.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      await createSale(url, price, false, null);
      router.push('/');
    } catch (error) {
      console.error('Error creating NFT. Details: ', error);
    }
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    console.log(data);
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));
    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data = type === 'fetchItemsListed'
      ? await contract.fetchItemsListed()
      : await contract.fetchMyNFTs();
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));
    return items;
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, createNFT, fetchNFTs, fetchMyNFTsOrListedNFTs, buyNFT, createSale, isLoadingNFT }}>
      { children }
    </NFTContext.Provider>
  );
};
