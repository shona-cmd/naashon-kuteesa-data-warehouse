declare module 'nodemailer' {
  import { SendMailOptions as NodemailerSendMailOptions } from 'nodemailer';

  export interface SendMailOptions extends NodemailerSendMailOptions {}

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<any>;
    verify(): Promise<any>;
    close(): void;
  }

  export function createTransporter(options: any): Transporter;
}

