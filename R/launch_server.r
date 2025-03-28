#!/usr/bin/Rscript

library(analogsea)
httr::set_config(httr::config(http_version = 0))

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

# PackSize
pack_size = as.numeric(args[5])
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
      print("Checking for dead instance")
      anydead = 1
      while(anydead == 1){
        dropnames = names(droplets())
        if(server_name %in% dropnames){
          print("Existing server for this analysis found - must be orphan. Deleting")
          id = which(dropnames == server_name)[1]
          to_delete = droplets()[[id]]
          if(to_delete$name %in% c("airrater-01","tiles","NSWFireHub","firehub-web","heatwave","othertools")){next}
            try({droplet_delete(to_delete)})
            Sys.sleep(15)
        }else{
          print("No dead droplets")
          anydead = 0
                                                                                                                          }
      }

      print("Trying Connection")

      ctest = try({
        print("Attempting to create droplet")
        #invisible(d1 <- droplet_create(server_name,region="sgp1",image = 36546482,size=isize,ssh_keys = "geokey",wait = TRUE,do.wait_time = 15))
        #invisible(d1 <- droplet_create(server_name,region="sgp1",image = 84195329,size=isize,ssh_keys = "geokey",wait = TRUE,do.wait_time = 15))
        invisible(d1 <- droplet_create(server_name,region="sgp1",image = 114041470,size=isize,ssh_keys = "geokey",wait = TRUE,do.wait_time = 15))
        Sys.sleep(30)
        print("Attempting to get ID of droplet")
        # Get ID of droplet
        d1 = droplet(d1$id)
        #Print IP address
        print(d1$networks$v4[[1]]$ip_address)
        Sys.sleep(30)
	print("Making swapfile")
	droplet_ssh(d1,"sudo fallocate -l 100G /swapfile;sudo chmod 600 /swapfile;sudo mkswap /swapfile;sudo swapon /swapfile")
       #   print("Setting up system monitoring")
        #    droplet_ssh(d1,"curl -sSL https://agent.digitalocean.com/install.sh | sh")
        #    tag_resource(name = "firetools", resource_id = d1$id)
        print("Installing FireTools")
        # Install FireTools
        droplet_ssh(d1,"git clone https://github.com/ozjimbob/FireTools2R")
      })
  
     if(class(ctest)=="try-error"){
       print("No SSH, retrying")
       Sys.sleep(30)
       try(droplet_delete(id),silent=TRUE)
        }else{
       print("connected")
       connected=TRUE
      }

}

# Copy files
print("Uploading Files")

#droplet_upload(d1,input_folder,"~/inputs")
droplet_upload(d1,input_folder,"/root/inputs/")
droplet_ssh(d1,"mkdir config")

#droplet_upload(d1,config_file,"~/config/config_linux.r")
droplet_upload(d1,config_file,"/root/config/config_linux.r")


#droplet_upload(d1,"R/global_config.r","~/config/global_config.r")
droplet_upload(d1,"/root/FireHubWeb/R/global_config.r","/root/config/global_config.r")


#droplet_upload(d1,"R/grid.tif","~/config/grid.tif")
droplet_upload(d1,"/root/FireHubWeb/R/grid.tif","/root/config/grid.tif")

droplet_upload(d1,"/root/FireHubWeb/R/grid.tif.aux.xml","/root/config/grid.tif.aux.xml")
#droplet_upload(d1,"R/grid.tif.aux.xml","~/config/grid.tif.aux.xml")

# Launch analysis

rtest<-try({
      droplet_ssh(d1,"cd FireTools2R; /usr/bin/Rscript run.r")
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



