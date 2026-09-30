export type InterestRegistrationNotification = { reference:string;productName:string;customerName:string;phone:string };
export async function interestRegistrationCreated(_event:InterestRegistrationNotification):Promise<void>{
  // Intentionally no-op. A future Telegram provider can implement this boundary
  // without coupling order persistence to an external notification service.
}
