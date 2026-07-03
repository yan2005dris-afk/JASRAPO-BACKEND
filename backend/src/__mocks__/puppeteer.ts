const mockPage = {
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock page pdf')),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
  connected: true,
};

const puppeteer = {
  launch: jest.fn().mockResolvedValue(mockBrowser),
};

export default puppeteer;
export { mockBrowser, mockPage };
