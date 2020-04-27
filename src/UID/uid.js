export default function getUID() {
  let id = "f" + Math.floor((1 + Math.random()) * 0x10000000);
  if (document.getElementById(id)) {
    console.log("UID generator: dupplicated id", id);
    id = getUID();
  }
  return id;
}
