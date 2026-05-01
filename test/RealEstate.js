const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('RealEstate', () => {
    let realEstate;
    let minter, other;

    const URI_1 = 'ipfs://QmExampleHash1';
    const URI_2 = 'ipfs://QmExampleHash2';

    beforeEach(async () => {
        [minter, other] = await ethers.getSigners();
        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstate.deploy();
    });

    describe('Deployment', ()=>{
        it('Sets the correct name', async ()=>{
            expect(await realEstate.name()).to.equal('Real Estate');});

        it('Sets the correct symbol', async ()=>{
            expect(await realEstate.symbol()).to.equal('REAL');});

        it('Starts with total supply of 0', async ()=>{
            expect(await realEstate.totalSupply()).to.equal(0);});
    })

    describe('Minting', ()=>{
        it('Returns the new token ID', async ()=>{
            const tx = await realEstate.connect(minter).mint(URI_1);
            const receipt = await tx.wait();
            const transferEvent = receipt.events.find((e) => e.event === 'Transfer');
            expect(transferEvent.args.tokenId).to.equal(1);
        });

        it('Increments total supply each mint', async ()=>{
            await realEstate.connect(minter).mint(URI_1);
            expect(await realEstate.totalSupply()).to.equal(1);

            await realEstate.connect(minter).mint(URI_2);
            expect(await realEstate.totalSupply()).to.equal(2);
        });

        it('Assigns the correct token URI', async ()=>{
            await realEstate.connect(minter).mint(URI_1);
             expect(await realEstate.ownerOf(1)).to.equal(minter.address);

            await realEstate.connect(minter).mint(URI_2);
            expect(await realEstate.ownerOf(2)).to.equal(minter.address);
            
            await realEstate.connect(other).mint(URI_1);
            expect(await realEstate.ownerOf(3)).to.equal(other.address);
        });

        it('Stores the tokenURI', async ()=>{
            await realEstate.connect(minter).mint(URI_1);
            expect(await realEstate.tokenURI(1)).to.equal(URI_1);
        });

        it('Emits a Transfer event from the zero address to the minter', async ()=>{
            await expect(realEstate.connect(minter).mint(URI_1))
                .to.emit(realEstate, 'Transfer')
                .withArgs(ethers.constants.AddressZero, minter.address, 1);
        });
    });


    describe('ERC721 behaviour', ()=>{
        beforeEach(async () => {
            await realEstate.connect(minter).mint(URI_1);
            await realEstate.connect(minter).mint(URI_2);
        });
        it('Returns correct balance of tokens for an address', async ()=>{
            expect(await realEstate.balanceOf(minter.address)).to.equal(2);
            expect(await realEstate.balanceOf(other.address)).to.equal(0);
        });

        it('Allows the owner to transfer a token', async ()=>{
            await realEstate
            .connect(minter)
            .transferFrom(minter.address, other.address, 1);

            expect(await realEstate.ownerOf(1)).to.equal(other.address);
            expect(await realEstate.balanceOf(minter.address)).to.equal(1);
            expect(await realEstate.balanceOf(other.address)).to.equal(1);
        });

        it('Prevents querying tokenURI if the token is nonexistent', async ()=>{
            await expect(realEstate.tokenURI(999)).to.be.revertedWith('ERC721: invalid token ID');
        });
        it('Reverts if quering owner of a nonexistent token', async ()=>{
            await expect(realEstate.ownerOf(999)).to.be.revertedWith('ERC721: invalid token ID');
        });
    });
})