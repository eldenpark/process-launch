if (require.main === module) {
  console.log('build3 start');
  throw new Error('error');
}
