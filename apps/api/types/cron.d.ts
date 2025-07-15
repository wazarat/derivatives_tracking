declare module 'cron' {
  export class CronJob {
    constructor(
      cronTime: string,
      onTick: () => void,
      onComplete?: () => void,
      start?: boolean,
      timezone?: string,
      context?: any,
      runOnInit?: boolean,
      utcOffset?: number | string
    );
    
    start(): void;
    stop(): void;
    lastDate(): Date;
    nextDates(count: number): Date[];
    fireOnTick(): void;
    setTime(time: any): void;
  }
  
  export class CronTime {
    constructor(time: string | Date, timezone?: string, utcOffset?: number | string);
    
    sendAt(): Date;
    sendAt(i: number): Date;
    getTimeout(): number;
  }
}
