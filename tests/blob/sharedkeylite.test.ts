import { BlobServiceClient, newPipeline, StorageSharedKeyCredential } from "@azure/storage-blob";

import { configLogger } from "../../src/common/Logger";
import { computeHMACSHA256 } from "../../src/common/utils/utils";
import BlobTestServerFactory from "../BlobTestServerFactory";
import { createStringToSignForSharedKeyLite } from "../table/utils/table.entity.tests.utils.for.rest";
import { getUniqueName } from "../testutils";

// Set true to enable debug log
configLogger(false);

describe("Blob SharedKeyLite", () => {
  const factory = new BlobTestServerFactory();
  let server = factory.createServer(false, false, true, undefined);
  const baseURL = `https://${server.config.host}:${server.config.port}/devstoreaccount1`;

  before(async () => {
    await server.start();
  });

  after(async () => {
    await server.close();
    await server.clean();
  });

  it(`Should work with create container @loki @sql`, async () => {
    const stringToSign = createStringToSignForSharedKeyLite(baseURL, path, null);
    const signature = computeHMACSHA256(stringToSign, key1);
    const authValue = `SharedKeyLite ${TableEntityTestConfig.accountName}:${signature}`;
    const headers = Object.assign(null, { Authorization: authValue });

    const serviceClient = new BlobServiceClient(
      baseURL,
      newPipeline(new StorageSharedKeyCredential(accountName, accountKey), {
        retryOptions: { maxTries: 1 },
        // Make sure socket is closed once the operation is done.
        keepAliveOptions: { enable: false }
      })
    );

    const containerName: string = getUniqueName("1container-with-dash");
    const containerClient = serviceClient.getContainerClient(containerName);

    await containerClient.create();
    await containerClient.delete();
  });
});
