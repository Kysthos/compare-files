if (module === require.main) {
  const argv = require('yargs')
    .command('$0 <file1> <file2> [arg]',
      'check if two files are identical',
      yargs => {
        yargs.positional('file1', {
          describe: 'first file to compare',
          type: 'string'
        })
        yargs.positional('file2', {
          describe: 'second file to compare',
          type: 'string'
        })
      })
    .option('b', {
      alias: 'bytes',
      demandOption: false,
      default: 1,
      describe: 'number of bytes to be compared at a time',
      type: 'number'
    })
    .check(({
      bytes
    }) => {
      if (bytes <= 0 || !Number.isInteger(bytes))
        throw new Error('bytes options should be an integer bigger than 0')
      return true;
    })
    .help('help')
    .alias('h', 'help')
    .alias('v', 'version')
    .argv

  const file1Path = argv.file1;
  const file2Path = argv.file2;
  const bytesToRead = argv.bytes;

  main(file1Path, file2Path, bytesToRead)
    .then(filesIdentical => console.log(filesIdentical))
    .catch(err => console.error(err))
} else {
  module.exports = (file1Path, file2Path, bytesToRead = 1) => {
    if (!file1Path || !file2Path) throw new Error('Two file paths required.')
    if (bytesToRead !== 1 && (bytesToRead <= 0 || !Number.isInteger(bytesToRead)))
      throw new Error('bytesToRead options should be an integer bigger than 0')
    return main(file1Path, file2Path, bytesToRead)
  }
}

async function main(file1Path, file2Path, bytesToRead) {
  const {
    open,
    stat
  } = require('fs').promises

  const [f1Stat, f2Stat] = await Promise.all([
    stat(file1Path),
    stat(file2Path)
  ])

  if (!f1Stat.isFile())
    throw new Error(`"${file1Path}" is not a file`)
  if (!f2Stat.isFile())
    throw new Error(`"${file2Path}" is not a file`)
  if (f1Stat.size !== f2Stat.size) return false;

  const fileSize = f1Stat.size;

  const [file1, file2] = await Promise.all([
    open(file1Path, 'r'),
    open(file2Path, 'r')
  ]);

  const buf1 = Buffer.alloc(bytesToRead);
  const buf2 = Buffer.alloc(bytesToRead);

  let i = 0;
  while (i < fileSize) {
    await Promise.all([
      file1.read(buf1, 0, bytesToRead, null),
      file2.read(buf2, 0, bytesToRead, null)
    ])

    if (!buf1.equals(buf2)) return false;
    i += bytesToRead
  }

  await Promise.all([
    file1.close(),
    file2.close()
  ])

  return true;
}