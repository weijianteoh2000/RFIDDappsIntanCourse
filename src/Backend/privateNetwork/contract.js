import { ethers } from 'ethers';
import { RFIDStatuses } from '../../Constant/RFIDStatus';
import RFIDV1 from '../../Constant/itemContractV1.json';


const { abi: contractV1ABI, bytecode: contractV1Bytecode } = RFIDV1;
// const proxyAdminAddress = '0xbB8b4330B30D7B133f454111237A0cB91e7ce0b7'; // ProxyAdmin address
// const logicContractAddress = '0x4F4Ff5F0A9bA29138eB0060F9052dA87dE1B8Ed5';
// const newLogicContractAddress = '0x4F4Ff5F0A9bA29138eB0060F9052dA87dE1B8Ed5';

export const getProvider = () => {
    if (typeof window.ethereum !== 'undefined') {
        return new ethers.BrowserProvider(window.ethereum);
    } else {
        console.error("MetaMask is not installed!");
        return null;
    }
}

const provider = getProvider();

async function getSigner() {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
}

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            console.log("Connected account:", address);
            return address;
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            throw new Error("Failed to connect MetaMask");
        }
    } else {
        alert("Sila pasang MetaMask untuk menggunakan ciri ini.");
        throw new Error("MetaMask not installed");
    }
}

export const deployContract = async (itemId, itemName, itemLocation, createdBy, newStatus) => {
    const signer = await getSigner();
    const factory = new ethers.ContractFactory(contractV1ABI, contractV1Bytecode, signer);
    const statusValue = RFIDStatuses[newStatus];

    if (statusValue === undefined) {
        console.error('Invalid RFID status:', newStatus);
        return;
    }
    try {
        const contract = await factory.deploy(itemId, itemName, itemLocation, createdBy, statusValue);
        await contract.waitForDeployment();
        const transactionHash = contract.deploymentTransaction().hash;
        console.log(`Transaction details ${transactionHash}`);
        const address = await contract.getAddress();
        console.log(`Contract deployed at address: ${address}`);
        return {
            contractAddress: address,
            transactionId: transactionHash,
        }
    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
};

export const updateItem = async (contractAddress, newName, newLocation, updatedBy) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractV1ABI, signer);
    try {
        const txResponse = await contract.updateItem(newName, newLocation, updatedBy);
        await txResponse.wait();
        //get transaction hash
        console.log(`Transaction Hash: ${txResponse.hash}`);
        console.log('Item updated');
        return txResponse.hash;
    } catch (error) {
        console.error('Update failed:', error);
        throw error;
    }
};

export const updateLocation = async (contractAddress, newLocation, updatedBy) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractV1ABI, signer);
    try {
        const txResponse = await contract.updateLocation(newLocation, updatedBy);
        await txResponse.wait();
        console.log('Location updated');
    } catch (error) {
        console.error('Update location failed:', error);
        throw error;
    }
};

export const deleteItem = async (contractAddress) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractV1ABI, signer);
    try {
        const txResponse = await contract.deleteItem();
        await txResponse.wait();
        console.log('Item marked as deleted');
        return txResponse.hash;
    } catch (error) {
        console.error('Deletion failed:', error);
        throw error;
    }
};

export const changeRFIDStatus = async (contractAddress, newStatus, updatedBy) => {
    if (!contractAddress || !newStatus) {
        console.error('Invalid or missing parameters');
        return Promise.reject('Invalid or missing parameters');
    }

    try {
        const signer = await getSigner();
        const contract = new ethers.Contract(contractAddress, contractV1ABI, signer);
        const statusValue = RFIDStatuses[newStatus];

        if (statusValue === undefined) {
            console.error('Invalid RFID status:', newStatus);
            return Promise.reject('Invalid RFID status');
        }

        const txResponse = await contract.changeRFIDStatus(statusValue, updatedBy);
        await txResponse.wait();
        console.log('RFID status updated');
        return Promise.resolve(); // Explicitly return a resolved promise
    } catch (error) {
        console.error('RFID status update failed:', error);
        return Promise.reject(error); // Explicitly return a rejected promise
    }
};

export const getItemDetail = async (contractAddress) => {
    const signer = await getSigner();
    const contract = new ethers.Contract(contractAddress, contractV1ABI, signer);
    try {
        const jsonString = await contract.getItemDetail();
        const itemDetails = JSON.parse(jsonString);
        return itemDetails;
    } catch (error) {
        console.error('Failed to get item detail:', error);
        throw error;
    }
} 
