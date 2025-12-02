// -------------------------------
// GLOBALS
// -------------------------------
let provider;
let signer;


const AUCTION_HOUSE = "0x656AA6B072dBC1b69Cf5033aa8011A13FB7F2680"; 

let auctionHouseAbi = null;
let auctionAbi = null;


// -------------------------------
// LOAD ABIs
// -------------------------------
async function loadAbis() {
  try {
    auctionHouseAbi = await fetch("./auctionHouseABI.json").then(r => r.json());
    auctionAbi = await fetch("./auctionABI.json").then(r => r.json());
  } catch (err) {
    console.error("ABI loading error:", err);
    alert("Could not load ABIs!");
  }
}
loadAbis();


// -------------------------------
// CONNECT METAMASK
// -------------------------------
document.getElementById("connect").onclick = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not installed! Please install MetaMask.");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    const addr = await signer.getAddress();
    alert("Connected wallet: " + addr);

    loadAuctions();

  } catch (e) {
    console.error(e);
    alert("Could not connect wallet!");
  }
};


// -------------------------------
// CREATE AUCTION
// -------------------------------
document.getElementById("createAuction").onclick = async () => {
  if (!auctionHouseAbi) return alert("ABIs not loaded yet!");

  const item = document.getElementById("itemName").value;
  const desc = document.getElementById("itemDesc").value;

  const priceEth = document.getElementById("startPrice").value;
  const startPrice = ethers.utils.parseEther(priceEth);

  const biddingTime = Number(document.getElementById("duration").value);

  const house = new ethers.Contract(AUCTION_HOUSE, auctionHouseAbi, signer);

  try {
    const tx = await house.createAuction(item, desc, startPrice, biddingTime);
    await tx.wait();
    alert("Auction created!");

    loadAuctions();

  } catch (err) {
    console.error(err);
    alert("Create failed.");
  }
};


// -------------------------------
// LOAD AUCTIONS
// -------------------------------
async function loadAuctions() {
  if (!auctionHouseAbi) return;

  const list = document.getElementById("auctionList");
  list.innerHTML = "Loading...";

  const house = new ethers.Contract(AUCTION_HOUSE, auctionHouseAbi, provider);

  try {
    const count = await house.getAuctionsCount();
    list.innerHTML = "";

    for (let i = 0; i < count; i++) {
      let info = await house.getAuction(i);

      const div = document.createElement("div");
      div.className = "auctionCard";

      div.innerHTML = `
        <h3>${info.itemName}</h3>
        <p>Address: ${info.auctionAddress}</p>
        <p>Start Price: ${ethers.utils.formatEther(info.startingPrice)} ETH</p>
        <p>Ends At: ${new Date(info.endAt * 1000).toLocaleString()}</p>

        <button onclick="bid('${info.auctionAddress}')">Bid</button>
        <button onclick="withdrawRefund('${info.auctionAddress}')">Withdraw Refund</button>
        <button onclick="endAuction('${info.auctionAddress}')">End Auction</button>
      `;

      list.appendChild(div);
    }

  } catch (err) {
    console.error(err);
    list.innerHTML = "Failed to load auctions.";
  }
}


// -------------------------------
// BID
// -------------------------------
window.bid = async function(address) {
  const amount = prompt("Bid amount in ETH:");

  const auction = new ethers.Contract(address, auctionAbi, signer);

  try {
    const tx = await auction.bid({ value: ethers.utils.parseEther(amount) });
    await tx.wait();

    alert("Bid placed!");
  } catch (err) {
    console.error(err);
    alert("Bid failed!");
  }
};


// -------------------------------
// WITHDRAW REFUND
// -------------------------------
window.withdrawRefund = async function(address) {
  const auction = new ethers.Contract(address, auctionAbi, signer);

  try {
    const tx = await auction.withdrawRefund();
    await tx.wait();

    alert("Refund withdrawn!");
  } catch (err) {
    console.error(err);
    alert("Withdraw failed!");
  }
};


// -------------------------------
// END AUCTION
// -------------------------------
window.endAuction = async function(address) {
  const auction = new ethers.Contract(address, auctionAbi, signer);

  try {
    const tx = await auction.end();
    await tx.wait();

    alert("Auction ended!");
    loadAuctions();
  } catch (err) {
    console.error(err);
    alert("End failed!");
  }
};
