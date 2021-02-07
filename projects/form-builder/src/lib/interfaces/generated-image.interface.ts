export interface GeneratedImage {
  webpVersion?: boolean;
  filePrefix?: string;
  width?: number;
  height?: number;
  // defaults to 'generated'
  folder?: string;
}
