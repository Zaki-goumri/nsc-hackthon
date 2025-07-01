import { User } from 'src/user/entities/user.entity';
import { whattsupMessageProps } from 'src/worker/queue/whattups.queue';
const link = '';
export const getWelcomeEmailTemplate = ({
  user,
  order,
}: whattsupMessageProps) =>
  `hello ${user.firstName} i hope you are well i wanna confirm ur order of ${order.product.name} if you are still intresetd you can pay for it via our app on the link ${link} `;
