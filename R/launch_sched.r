#!/usr/bin/Rscript

library(analogsea)
httr::set_config(httr::config(http_version = 0))
source("../../do.r")
print("Parsing args")
# Retrieve command-line arguments
args = commandArgs(trailingOnly=TRUE)

# uuid name for the server
server_name = args[1]

# local folder to copy from digital ocean
input_folder = paste0("/root/FireHubWeb/sched/",server_name,"/")

# File containing analysis configuration
config_file = paste0(input_folder,"config_sched.r")

# Local folder to copy output to
output_folder = paste0('/root/FireHubWeb/output/',server_name,"_",format(Sys.Date(),"%Y-%m"))

# PackSize
pack_size = 50000001
if(pack_size > 50000000){
      #isize = "s-8vcpu-32gb"

      isize = "s-8vcpu-32gb"
      print("Large instance")
}else{
      print("Small instance")
      isize = "s-8vcpu-16gb"
     #isize="s-8vcpu-32gb"
}



print("OAuth")
# Auth with DigitalOcean
invisible(do_oauth())

print("Starting Connection")
# Create droplet
connected=FALSE
while(connected==FALSE){
      Sys.sleep(floor(runif(1,20,40)))
  
      print("Trying Connection")

      ctest = try({
        print("Attempting to create droplet")

        invisible(d1 <- droplet_create(server_name,region="sgp1",image = 114041470,size=isize,ssh_keys = "geokey",wait = TRUE,do.wait_time = 30))
        Sys.sleep(floor(runif(1,20,40)))
        print("Attempting to get ID of droplet")
        # Get ID of droplet
        d1 = droplet(d1$id)
        #Print IP address
        print(d1$networks$v4[[1]]$ip_address)
        Sys.sleep(floor(runif(1,20,40)))
	print("Making swapfile")
	droplet_ssh(d1,"sudo fallocate -l 100G /swapfile;sudo chmod 600 /swapfile;sudo mkswap /swapfile;sudo swapon /swapfile")
       #   print("Setting up system monitoring")
        #    droplet_ssh(d1,"curl -sSL https://agent.digitalocean.com/install.sh | sh")
        #    tag_resource(name = "firetools", resource_id = d1$id)
        Sys.sleep(floor(runif(1,20,40)))
        print("Installing FireTools")
        # Install FireTools
        droplet_ssh(d1,"git clone https://github.com/ozjimbob/FireTools2R")
      })
  
     if(class(ctest)=="try-error"){
       print("No SSH, retrying")
       Sys.sleep(floor(runif(1,20,40)))
       dropnames = names(droplets())
       id = which(dropnames == server_name)
       try({
            for(idx in id){
            droplet_delete(idx)}},silent=TRUE)
        }else{
       print("connected")
       connected=TRUE
      }

}

# Copy files
print("Uploading Files")

droplet_upload(d1,input_folder,"/root/inputs/")
droplet_ssh(d1,"mkdir /root/config")
droplet_upload(d1,config_file,"/root/config/config_sched.r")


droplet_upload(d1,"/root/FireHubWeb/R/global_config.r","/root/config/global_config.r")

droplet_upload(d1,"/root/FireHubWeb/R/grid.tif","/root/config/grid.tif")

droplet_upload(d1,"/root/FireHubWeb/R/grid.tif.aux.xml","/root/config/grid.tif.aux.xml")

# Launch analysis

rtest<-try({
      droplet_ssh(d1,"cd FireTools2R; /usr/bin/Rscript run_sched.r")
})

if(class(rtest)=="try-error"){
      warning("#!#!#!# Model Execution Failure - Check Logs")
  droplet_delete(d1)
      quit("no",status=1)

}

print("Downloading results")
# Download results
dtest <- try({

        #tuser = "root"
        #cmd = paste0("scp -r root@",droplet_id(as.droplet(d1)),":/root/FireTools2R/output ",output_folder)
        #a=system(cmd,intern=TRUE)
        #print(a)
        dir.create(output_folder)

        droplet_download(d1,"/root/FireTools2R/output/",output_folder,verbose=TRUE)

})

if(class(dtest)=="try-error"){
      warning("#!#!#!# Result download failed")
  droplet_delete(d1)
      quit("no",status=1)
}

#cat("Press Enter to continue...")
#invisible(scan("stdin", character(), nlines = 1, quiet = TRUE))

print("Deleting virtual machine")

dtest <- try({
      droplet_delete(d1)
})

if(class(dtest)=="try-error"){
      warning("#!#!#!# Droplet delete failed")
  quit("no",status=1)
}



