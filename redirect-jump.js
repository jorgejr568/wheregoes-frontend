import axios from "axios";

const FINAL_REDIRECT = "https://google.com";

const createRedirect = async (url) => {
  const { data } = await axios.post("https://j-jr.app/shrt", {
    url,
  });

  return `https://j-jr.app/${data.id}`;
};

const main = async () => {
  const jumps = process.argv[2] || 5;

  let url = FINAL_REDIRECT;
  for (let i = 0; i < jumps; i++) {
    url = await createRedirect(url);
    console.log(`Jump ${i + 1}: ${url}`);
  }

  console.log(`Final jump: ${url}`);
};

main();
