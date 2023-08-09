const express = require('express');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

const app = express();
const port = process.env.PORT || 3000;

const fileSize = 1024 * 1024 * 1024;
const chunkSize = 1024 * 1024;
const lineLength = 100;

async function generateRandomChars(chunkSize) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < chunkSize; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

async function createFile(filePath, fileSize) {
  const writeStream = fs.createWriteStream(filePath);
  const buffer = Buffer.alloc(chunkSize);

  let remainingSize = fileSize;
  while (remainingSize > 0) {
    const currentChunkSize = Math.min(chunkSize, remainingSize);
    const randomChars = await generateRandomChars(currentChunkSize);
    buffer.write(randomChars, 'utf-8');
    writeStream.write(buffer.slice(0, currentChunkSize));
    remainingSize -= currentChunkSize;
  }

  writeStream.end();
}

async function sortAndSaveFile(inputFilePath, outputFilePath) {
  const readStream = fs.createReadStream(inputFilePath);
  const writeStream = fs.createWriteStream(outputFilePath);
  const sortedChunks = [];
  let currentLength = 0;

  const transformStream = new stream.Transform({
    transform(chunk, encoding, callback) {
      const chunkString = chunk.toString();
      const sortedLine = chunkString.split('').sort().join('');

      sortedChunks.push(sortedLine);
      currentLength += sortedLine.length;

      if (currentLength >= lineLength) {
        writeStream.write(sortedChunks.join(''), 'utf-8');
        sortedChunks.length = 0;
        currentLength = 0;
      }

      callback();
    },
    flush(callback) {
      if (sortedChunks.length > 0) {
        writeStream.write(sortedChunks.join(''), 'utf-8');
      }
      callback();
    }
  });

  readStream.pipe(transformStream).pipe(writeStream);
  await new Promise(resolve => {
    writeStream.on('finish', resolve);
  });

  console.log('File sorted and saved.');
}

app.get('/generationFile', async (req, res) => {
  const inputFilePath = path.join(__dirname, 'input.txt');
  await createFile(inputFilePath, fileSize);
  res.send('File generated.');
});

app.get('/sortAndSaveFile', async (req, res) => {
  const inputFilePath = path.join(__dirname, 'input.txt');
  const outputFilePath = path.join(__dirname, 'sorted.txt');

  await sortAndSaveFile(inputFilePath, outputFilePath);
  res.send('File sorted and saved.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});