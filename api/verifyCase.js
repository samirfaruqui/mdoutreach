import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

export async function handler(request, context) {
    try {
        const body = await request.json();
        const { caseId, passcode } = body;

        if (!caseId || !passcode) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Missing caseId or passcode"
                }),
                { status: 400 }
            );
        }

        const account = process.env.STORAGE_ACCOUNT_NAME;
        const key = process.env.STORAGE_ACCOUNT_KEY;

        const tableUrl = `https://${account}.table.core.windows.net`;
        const credential = new AzureNamedKeyCredential(account, key);

        const tableClient = new TableClient(tableUrl, "Case", credential);

        try {
            // Primary key = partitionKey + rowKey
            const entity = await tableClient.getEntity(caseId, passcode);

            return new Response(
                JSON.stringify({
                    success: true,
                    caseId,
                    mode: entity.mode,
                    sender: entity.sender
                }),
                { status: 200 }
            );

        } catch (err) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Invalid Case ID or Passcode"
                }),
                { status: 401 }
            );
        }

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
        );
    }
}
