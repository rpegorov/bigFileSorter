
## App for sorting a large file

run docker:
```
# Build the Docker image
docker build -t rp/filesortert .

# Run the Docker container with memory limit
docker run -m 512M filesortert

```

### how it works:

Make a GET request to the 

`http://localhost:{your_port}/generationFile` - for generate file

`http://localhost:{your_port}/sortAndSaveFile` - for sort generated file
