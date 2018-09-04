#onfig file
# Define geodatabases

# FIRE geodatabase
fire_gdb = "../inputs/fire.gpkg"

# VEG geodatabase
veg_gdb = "../inputs/vegetation.gpkg"

# CORP geodatabase
corp_gdb = "../inputs/corporate.gpkg"

# Asset geodatabase
asset_gdb = "../inputs/assets.gpkg"

# Gazette geodatabase
#gazette_gdb = "G:/FireHub/UTAS-20180601T044937Z-001/UTAS/NTHI_APR2018/NTHI_APR2018/Inputs/NPWSReservesGazettalDates.gdb"
gazette_gdb = ""

# Define layers

i_vt_fire_history = "fire_history"
i_vt_boundary = "branches"
i_vt_veg = c("veg_neng")
i_vt_veg_lut = "fire_veg_type_lut"

# Define fire season field
f_fireseason="FireYear"

# Define fire management zones layer
i_vt_fmz = "FireManagementZone"
i_vt_fmz_lut = "fire_zone_type_lut"
f_vt_fmz = "ZONE"
f_vt_maxint = "MaxInt"
  
# Define fire managemt zone type field
f_fmz = "SubtypeCD"

# Define SFAZ code
c_sfaz = 6103

# Define gazette table
i_vt_gazette = "NPWS_EstateInternalBoundaries"
f_gazette_date = "LATEST_GAZ"

# Define veg ID field
f_vegid = "Veg"

# Define max and min interval fields
f_vegmax = "MAX"
f_vegmin = "MIN"
f_vegadv = "ADV"
f_vegfireprone = "FireProneV"

# Define spatial unit field
f_spatial_unit = "Branch"
# Select spatial unit
d_spatial_unit = ""
# Define subunit field


# Define projection
proj_crs = "+proj=lcc +lat_1=-30.75 +lat_2=-35.75 +lat_0=-33.25 +lon_0=147 +x_0=9300000 +y_0=4500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs "

# Define raster resolution
ras_res = 25

# Define tempdir
rast_temp = "../outputs"

# Define year
current_year = 2018 -1

# Define analysis bounding box
#subextent = extent(9809740,9830161,4917462,4935638)
#subextent = extent(9326200,9578400,4693800,4838400)
subextent=NULL


