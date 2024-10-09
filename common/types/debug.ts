export interface IDebugResponse {
	tmtVersion: string | null;
	tmtCommitSha: string | null;
	tmtImageBuildTimestamp: string | null;
	tmtStorageFolder: string;
	tmtPort: string | number;
	tmtLogAddress: string | null;
	tmtSayPrefix: string;
	webSockets: any[];
}
