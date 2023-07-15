const fs = require('fs');

// Function to read data from the file
function readData() {
  try {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return {};
  }
}

// Function to write data to the file
function writeData(data) {
  try {
    fs.writeFileSync('data.json', JSON.stringify(data));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

module.exports = {
  readData,
  writeData,
};
