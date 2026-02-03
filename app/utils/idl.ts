export type Polymolt = {
  "version": "0.1.0";
  "name": "polymolt";
  "instructions": [
    {
      "name": "createMarket";
      "accounts": [
        {
          "name": "market";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "creator";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "question";
          "type": "string";
        },
        {
          "name": "expiresAt";
          "type": "i64";
        }
      ];
    },
    {
      "name": "placeBet";
      "accounts": [
        {
          "name": "market";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "bet";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "user";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "position";
          "type": "bool";
        },
        {
          "name": "amount";
          "type": "u64";
        }
      ];
    },
    {
      "name": "resolveMarket";
      "accounts": [
        {
          "name": "market";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "resolution";
          "isMut": true;
          "isSigner": false;
        },
        {
          "name": "resolver";
          "isMut": true;
          "isSigner": true;
        },
        {
          "name": "betAccount";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "systemProgram";
          "isMut": false;
          "isSigner": false;
        }
      ];
      "args": [
        {
          "name": "outcome";
          "type": "bool";
        }
      ];
    },
    {
      "name": "claimWinnings";
      "accounts": [
        {
          "name": "market";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "bet";
          "isMut": false;
          "isSigner": false;
        },
        {
          "name": "user";
          "isMut": true;
          "isSigner": true;
        }
      ];
      "args": [];
    }
  ];
  "accounts": [
    {
      "name": "market";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "creator";
            "type": "publicKey";
          },
          {
            "name": "question";
            "type": "string";
          },
          {
            "name": "expiresAt";
            "type": "i64";
          },
          {
            "name": "resolved";
            "type": "bool";
          },
          {
            "name": "outcome";
            "type": {
              "option": "bool";
            };
          },
          {
            "name": "totalYesAmount";
            "type": "u64";
          },
          {
            "name": "totalNoAmount";
            "type": "u64";
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    },
    {
      "name": "bet";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "market";
            "type": "publicKey";
          },
          {
            "name": "user";
            "type": "publicKey";
          },
          {
            "name": "position";
            "type": "bool";
          },
          {
            "name": "amount";
            "type": "u64";
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    },
    {
      "name": "resolution";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "market";
            "type": "publicKey";
          },
          {
            "name": "resolver";
            "type": "publicKey";
          },
          {
            "name": "outcome";
            "type": "bool";
          },
          {
            "name": "stakeAmount";
            "type": "u64";
          },
          {
            "name": "createdAt";
            "type": "i64";
          }
        ];
      };
    }
  ];
  "errors": [
    {
      "code": 6000;
      "name": "AlreadyResolved";
      "msg": "Market is already resolved";
    },
    {
      "code": 6001;
      "name": "MarketExpired";
      "msg": "Market has expired";
    },
    {
      "code": 6002;
      "name": "MarketNotExpired";
      "msg": "Market has not expired yet";
    },
    {
      "code": 6003;
      "name": "MarketResolved";
      "msg": "Market is resolved";
    },
    {
      "code": 6004;
      "name": "MarketNotResolved";
      "msg": "Market is not resolved yet";
    },
    {
      "code": 6005;
      "name": "NotAWinner";
      "msg": "Not a winning bet";
    }
  ];
};

export const IDL: Polymolt = {
  "version": "0.1.0",
  "name": "polymolt",
  "instructions": [
    {
      "name": "createMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "expiresAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "placeBet",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "position",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "accounts": [
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "resolution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "resolver",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "betAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "market",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "totalYesAmount",
            "type": "u64"
          },
          {
            "name": "totalNoAmount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "position",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "resolution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "publicKey"
          },
          {
            "name": "resolver",
            "type": "publicKey"
          },
          {
            "name": "outcome",
            "type": "bool"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AlreadyResolved",
      "msg": "Market is already resolved"
    },
    {
      "code": 6001,
      "name": "MarketExpired",
      "msg": "Market has expired"
    },
    {
      "code": 6002,
      "name": "MarketNotExpired",
      "msg": "Market has not expired yet"
    },
    {
      "code": 6003,
      "name": "MarketResolved",
      "msg": "Market is resolved"
    },
    {
      "code": 6004,
      "name": "MarketNotResolved",
      "msg": "Market is not resolved yet"
    },
    {
      "code": 6005,
      "name": "NotAWinner",
      "msg": "Not a winning bet"
    }
  ]
};

export const PROGRAM_ID = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";
