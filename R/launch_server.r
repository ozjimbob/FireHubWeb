#!/usr/bin/Rscript

library(analogsea)

# Retrieve command-line arguments
args = commandArgs(trailingOnly=TRUE)

# uuid name for the server
server_name = args[1]

# local folder to copy from digital ocean
input_folder = args[2]

# File containing analysis configuration
config_file = args[3]

# Local folder to copy output to
output_folder = args[4]

# Auth with DigitalOcean
do_oauth()

# Create droplet
d1 <- droplet_create(server_name,region="sgp1",image = 36546482,size="s-6vcpu-16gb",ssh_keys = "geokey",wait = TRUE)

# Get ID of droplet
d1 = droplet(d1$id)

# Print IP address
print(d1$networks$v4[[1]]$ip_address)

Sys.sleep(30)

# Copy files
droplet_upload(d1,input_folder,"~/inputs",verbose=TRUE)

cat("Press Enter to continue...")
invisible(scan("stdin", character(), nlines = 1, quiet = TRUE))

droplet_delete(d1)

