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
duration: string;
price: string;
inclusions: string[];
exclusions: string[];
cancellationPolicy?: string;
location: string;   
operator: string;
details: string;
restrictions: string;
contact: ContactInfo;
};


export type AvailabilityMap = Record<number, number>;