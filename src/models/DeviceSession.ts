export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export class DeviceSession {
    id: number = 0;
    deviceName: string = '';
    deviceType: DeviceType = 'desktop';
    createdAt: string = '';
    lastUsedAt: string = '';
    isCurrent: boolean = false;
}
