import { Types } from '~/config/typeConfigs';
import { AddLabels } from '~/flowTypes';
import { Asset, AssetType } from '~/services/AssetService';
import { NodeEditorSettings } from '~/store/nodeEditor';

import { AddLabelsFormState } from './AddLabelsForm';

export const initializeForm = (settings: NodeEditorSettings): AddLabelsFormState => {
    if (settings.originalAction && settings.originalAction.type === Types.add_input_labels) {
        const action = settings.originalAction as AddLabels;
        return {
            labels: {
                value: action.labels.map(label => {
                    return { id: label.uuid, name: label.name, type: AssetType.Label };
                })
            },
            valid: true
        };
    }

    return {
        labels: { value: [] },
        valid: false
    };
};

export const stateToAction = (actionUUID: string, formState: AddLabelsFormState): AddLabels => {
    return {
        type: Types.add_input_labels,
        labels: this.getAsset(formState.labels.value, AssetType.Label),
        uuid: actionUUID
    };
};

export const getAsset = (assets: Asset[], type: AssetType): any[] => {
    return assets.filter((asset: Asset) => asset.type === type).map((asset: Asset) => {
        return { uuid: asset.id, name: asset.name };
    });
};
