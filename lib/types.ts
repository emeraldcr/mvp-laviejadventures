export type ContactInfo = {
whatsapp: string;
email: string;
youtube: string;
facebook: string;
twitter: string;
instagram: string;
};


export type TourInfo = {
name: string;
operator: string;
details: string;
restrictions: string;
contact: ContactInfo;
};


export type AvailabilityMap = Record<number, number>;