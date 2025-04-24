COLONY_NAMES = {
    "Acadia": "Acadia-ac",
    "Avonlea": "Avonlea-av",
    "Baker": "Baker-ba",
    "Brightstone": "Brightstone-bt",
    "Cascade": "Cascade-cc",
    "Clearview": "Clearview-cv",
    "Clearwater": "Clearwater-cw",
    "Crystal": "Crystal Spring-cs",
    "Elm River": "Elm River-er",
    "Emerald": "Emerald-em",
    "Fairholme": "fh.hbni.net-fh",
    "Glenway": "Glenway-gw",
    "Good": "Good Hope-gh",
    "goodhope": "goodhope.ca",
    "Green": "Green Acres-ga",
    "Greenwald": "Greenwald-gr",
    "Haven": "Haven-ha",
    "Hidden Valley": "Hidden Valley-hd",
    "Homewood": "Homewood-hw",
    "Hutterville": "Hutterville-hv",
    "Keystone": "Keystone-ks",
    "Lakeside": "Lakeside-ls",
    "Maple Grove": "Maple Grove-mg",
    "Millshof": "Millshof-mh",
    "Netley": "Netley-nt",
    "Oak River": "Oak River-or",
    "Oakbluff": "Oakbluff-ob",
    "Odanah": "Odanah-od",
    "Pineland": "Pineland-pl",
    "Poplar Point": "PPCOL-pp",
    "Riverbend": "Riverbend-rb",
    "RollingAcres": "RollingAcres-ra",
    "Silverwinds": "Silverwinds-sw",
    "Skyview": "Skyview-SK",
    "Springfield": "Springfield-sf",
    "Springhill": "Springhill-sh",
    "Sunnyside": "Sunnyside-ss",
    "Tri-Leaf": "Tri-Leaf-tl",
    "Valley View": "Valley View-vv",
    "Vermillion": "Vermillion-vm",
    "West Roc": "West Roc-wr",
    "Whiteshell": "Whiteshell-ws",
    "Wingham": "Wingham-wh",
}


def get_all_colony_names():
    return [f"{name}" for name, code in COLONY_NAMES.items()]


def get_colony_organizational_unit(colony_name):
    return COLONY_NAMES.get(colony_name, None)


def get_colony_code_name(colony_name):
    if colony_code := get_colony_organizational_unit(colony_name):
        return colony_code.split("-")[1].upper()
