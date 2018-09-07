#!/usr/bin/Rscript

library(analogsea)


print("Parsing args")
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
print("OAuth")
# Auth with DigitalOcean
do_oauth()

print("Starting Connection")
# Create droplet
connected=FALSE
while(connected==FALSE){
  print("Trying Connection")
  ctest = try({
    d1 <- droplet_create(server_name,region="sgp1",image = 36546482,size="s-6vcpu-16gb",ssh_keys = "geokey",wait = TRUE,do.wait_time = 5)

    # Get ID of droplet
    d1 = droplet(d1$id)

    # Print IP address
    print(d1$networks$v4[[1]]$ip_address)
    
    Sys.sleep(30)
    print("Installing FireTools")

    # Install FireTools
    droplet_ssh(d1,"git clone https://github.com/ozjimbob/FireTools2R")
  })

  if(class(ctest)=="try-error"){
    print("No SSH, retrying")
    try(droplet_delete(id),silent=TRUE)
  }else{
    print("connected")
    connected=TRUE
  }

}

# Copy files
droplet_upload(d1,input_folder,"~/inputs")
droplet_ssh(d1,"mkdir config")
droplet_upload(d1,config_file,"~/config/config_linux.r")
droplet_upload(d1,"R/global_config.r","~/config/global_config.r")

# Launch analysis
droplet_ssh(d1,"cd FireTools2R; /usr/bin/Rscript run.r")


# Download results
droplet_download(d1,"FireTools2R/output/",output_folder,verbose=TRUE)

#cat("Press Enter to continue...")
#invisible(scan("stdin", character(), nlines = 1, quiet = TRUE))

droplet_delete(d1)

