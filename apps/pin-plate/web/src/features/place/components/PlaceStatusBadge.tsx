import * as s from './PlaceStatusBadge.css';
import { PLACE_STATUS_LABEL } from '../constants/status';
import type { PlaceStatus } from '../types/place';

interface Props {
  status: PlaceStatus;
}

export const PlaceStatusBadge = ({ status }: Props) => (
  <span className={`${s.base} ${s.variant[status]}`}>
    {PLACE_STATUS_LABEL[status]}
  </span>
);
