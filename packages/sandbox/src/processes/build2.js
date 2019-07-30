async function build() {
  console.log('build2 start'); // eslint-disable-line
  await delay();
  console.log('build2 end'); // eslint-disable-line
}

async function delay(ms = 2000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (require.main === module) {
  build();
}
