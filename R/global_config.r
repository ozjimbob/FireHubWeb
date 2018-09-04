# global config


gdal_path = "/usr/bin/"
gdal_rasterize = paste0(gdal_path,"gdal_rasterize")
gdal_polygonize = paste0(gdal_path,"gdal_polygonize.py")

# Define number of cores
clustNo = 8

rasterOptions(progress="text",chunksize = 10000)

OS="Linux"


