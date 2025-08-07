export interface Dashboard {
  id: string;
  title: string;
  createdAt?: {
    toDate: () => Date;
  };
}
