This was written just as an exercise. 

Compares two files to check if they have the same content (like `cmp`).

It can be used as a required module or directly from the terminal.

Help screen for the terminal use:
```
index.js <file1> <file2> [arg]

check if two files are identical

Positionals:
  file1  first file to compare                                          [string]
  file2  second file to compare                                         [string]

Options:
  -b, --bytes    number of bytes to be compared at a time  [number] [default: 1]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

When required from another module, it returns a function of following signature:

`compare(file1, file2[, bytesToRead])`
* `file1 {String}` path to the first file
* `file2 {String}` path to the second file
* `bytesToRead {Integer}` number of bytes to compare at a time, default: `1`.
  
Returns a `Promise` that resolves to `true` or `false`.

```js
const compare = require('./index')

compare(file1, file2)
  .then(result => console.log(result))
  .catch(err => console.error(err))

async function myAsync() {
  const same = await compare(file1, file2, 16)
}
```


TODO: write more tests