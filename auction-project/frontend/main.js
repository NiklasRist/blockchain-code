let provider;
let signer;

const auctionHouseAddress = "PASTE_AUCTIONHOUSE_ADDRESS";
const auctionHouseAbi = [ /* ABI hier einfügen */ ];

document.getElementById("connect").onclick = async () => {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  alert("Wallet connected: " + await signer.getAddress());
};

document.getElementById("createAuction").onclick = async () => {
  const item = document.getElementById("itemName").value;
  const desc = document.getElementById("itemDesc").value;
  const price = ethers.utils.parseEther(
    document.getElementById("startPrice").value
  );
  const duration = document.getElementById("duration").value;

  const house = new ethers.Contract(
    auctionHouseAddress,
    auctionHouseAbi,
    signer
  );

  const tx = await house.createAuction(item, desc, price, duration);
  await tx.wait();

  alert("Auction created!");
  loadAuctions();
};

async function loadAuctions() {
  const list = document.getElementById("auctionList");
  
  const house = new ethers.Contract(
    auctionHouseAddress,
    auctionHouseAbi,
    provider
  );

  const count = await house.getAuctionsCount();
  list.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const a = await house.getAuction(i);

    const div = document.createElement("div");
    div.className = "auctionCard";

    div.innerHTML = `
      <h3>${a.itemName}</h3>
      <p>Contract: ${a.auctionAddress}</p>
      <p>Start price: ${ethers.utils.formatEther(a.startingPrice)} ETH</p>
      <button onclick="bid('${a.auctionAddress}')">Bid</button>
      <button onclick="refund('${a.auctionAddress}')">Withdraw Refund</button>
      <button onclick="endAuction('${a.auctionAddress}')">End Auction</button>
    `;

    list.appendChild(div);
  }
}

window.bid = async function(address) {
  const bidAmount = prompt("Bid amount in ETH:");
  const AuctionAbi = [ /* Auction ABI hier einfügen */ ];

  const auction = new ethers.Contract(address, AuctionAbi, signer);

  const tx = await auction.bid({
    value: ethers.utils.parseEther(bidAmount)
  });
  await tx.wait();
  alert("Bid placed!");
};

window.refund = async function(address) {
  const AuctionAbi = [ /* Auction ABI */ ];
  const auction = new ethers.Contract(address, AuctionAbi, signer);

  const tx = await auction.withdrawRefund();
  await tx.wait();

  alert("Refund withdrawn!");
};

window.endAuction = async function(address) {
  const AuctionAbi = [ /* Auction ABI */ ];
  const auction = new ethers.Contract(address, AuctionAbi, signer);

  const tx = await auction.end();
  await tx.wait();

  alert("Auction ended!");
};

loadAuctions();
