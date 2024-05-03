export interface IDebugResponse {
	tmtVersion: string | null;
	tmtStorageFolder: string;
	tmtPort: string | number;
	tmtLogAddress: string | null;
	tmtSayPrefix: string;
	webSockets: any[];
}
