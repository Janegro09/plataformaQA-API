exports.MockPerfilamientoFile = {
    headers: [
        "Grupo_Anterior",
        "ATENDIDAS",
        "SALIENTES",
        "STAFF",
        "TM-ACD",
        "TM-ACW",
        "TM-HOLD"
    ],
    rows: [
        {
            "Grupo_Anterior": 0,
            "ATENDIDAS": 100,
            "SALIENTES": 0,
            "STAFF": 0.0000123456,
            "TM-ACD": 123,
            "TM-ACW": 2,
            "TM-HOLD": 2
        },
        {
            "Grupo_Anterior": 0,
            "ATENDIDAS": 200,
            "SALIENTES": 0,
            "STAFF": 0.00001234565,
            "TM-ACD": 123,
            "TM-ACW": 3,
            "TM-HOLD": 3
        },    
        {
            "Grupo_Anterior": 1,
            "ATENDIDAS": 300,
            "SALIENTES": 0,
            "STAFF": 0.0000123457,
            "TM-ACD": 123,
            "TM-ACW": 4,
            "TM-HOLD": 4
        },
        {
            "Grupo_Anterior": 1,
            "ATENDIDAS": 400,
            "SALIENTES": 1,
            "STAFF": 0.00001234575,
            "TM-ACD": 123,
            "TM-ACW": 5,
            "TM-HOLD": 5
        },
        {
            "Grupo_Anterior": 0,
            "ATENDIDAS": 150,
            "SALIENTES": 2,
            "STAFF": 0.0000123458,
            "TM-ACD": 234,
            "TM-ACW": 6,
            "TM-HOLD": 6
        },
        {
            "Grupo_Anterior": 0,
            "ATENDIDAS": 178,
            "SALIENTES": 5,
            "STAFF": 0.00001234585,
            "TM-ACD": 234,
            "TM-ACW": 7,
            "TM-HOLD": 7
        },    
        {
            "Grupo_Anterior": 1,
            "ATENDIDAS": 435,
            "SALIENTES": 5,
            "STAFF": 0.0000123459,
            "TM-ACD": 234,
            "TM-ACW": 8,
            "TM-HOLD": 8
        },
        {
            "Grupo_Anterior": 1,
            "ATENDIDAS": 235,
            "SALIENTES": 8,
            "STAFF": 0.00001234595,
            "TM-ACD": 234,
            "TM-ACW": 9,
            "TM-HOLD": 9
        }
    ]
}

exports.MockResponseGetColumns = [
    {
        "columnName": "Grupo_Anterior",
        "VMax": 1,
        "VMin": 0,
        "DefaultValues": {
            "Q1": {
                "VMin": 0,
                "VMax": 0.25
            },
            "Q2": {
                "VMax": 0.5
            },
            "Q3": {
                "VMax": 0.75
            },
            "Q4": {
                "VMax": 1
            }
        }
    },
    {
        "columnName": "ATENDIDAS",
        "VMax": 435,
        "VMin": 100,
        "DefaultValues": {
            "Q1": {
                "VMin": 100,
                "VMax": 150
            },
            "Q2": {
                "VMax": 200
            },
            "Q3": {
                "VMax": 300
            },
            "Q4": {
                "VMax": 435
            }
        }
    },
    {
        "columnName": "SALIENTES",
        "VMax": 8,
        "VMin": 0,
        "DefaultValues": {
            "Q1": {
                "VMin": 0,
                "VMax": 0
            },
            "Q2": {
                "VMax": 1
            },
            "Q3": {
                "VMax": 2
            },
            "Q4": {
                "VMax": 8
            }
        }
    },
    {
        "columnName": "STAFF",
        "VMax": 0.00001234595,
        "VMin": 0.0000123456,
        "DefaultValues": {
            "Q1": {
                "VMin": 0.0000123456,
                "VMax": 0.00001234565
            },
            "Q2": {
                "VMax": 0.00001234575
            },
            "Q3": {
                "VMax": 0.00001234585
            },
            "Q4": {
                "VMax": 0.00001234595
            }
        }
    },
    {
        "columnName": "TM-ACD",
        "VMax": 234,
        "VMin": 123,
        "DefaultValues": {
            "Q1": {
                "VMin": 123,
                "VMax": 123
            },
            "Q2": {
                "VMax": 234
            },
            "Q3": {
                "VMax": 234
            },
            "Q4": {
                "VMax": 234
            }
        }
    },
    {
        "columnName": "TM-ACW",
        "VMax": 9,
        "VMin": 2,
        "DefaultValues": {
            "Q1": {
                "VMin": 2,
                "VMax": 3
            },
            "Q2": {
                "VMax": 5
            },
            "Q3": {
                "VMax": 7
            },
            "Q4": {
                "VMax": 9
            }
        }
    },
    {
        "columnName": "TM-HOLD",
        "VMax": 9,
        "VMin": 2,
        "DefaultValues": {
            "Q1": {
                "VMin": 2,
                "VMax": 3
            },
            "Q2": {
                "VMax": 5
            },
            "Q3": {
                "VMax": 7
            },
            "Q4": {
                "VMax": 9
            }
        }
    }
]