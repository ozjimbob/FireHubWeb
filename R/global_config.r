# global config


gdal_path = "/usr/bin/"
gdal_rasterize = paste0(gdal_path,"gdal_rasterize")
gdal_polygonize = paste0(gdal_path,"gdal_polygonize.py")

# Define number of cores
clustNo = 5

rasterOptions(progress="",timer=TRUE,chunksize = 10000)

OS="Linux"

old=FALSE
sf::sf_use_s2(FALSE)
new_analysis=TRUE

