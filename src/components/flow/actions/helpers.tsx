import * as React from 'react';
import { Contact, Group, RecipientsAction } from '~/flowTypes';
import { Asset, AssetType } from '~/store/flowContext';
import { NodeEditorSettings } from '~/store/nodeEditor';
import { createUUID } from '~/utils';

const styles = require('~/components/shared.scss');

export const getActionUUID = (nodeSettings: NodeEditorSettings, currentType: string): string => {
    if (nodeSettings.originalAction && nodeSettings.originalAction.type === currentType) {
        return nodeSettings.originalAction.uuid;
    }

    return createUUID();
};

export const getRecipients = (action: RecipientsAction): Asset[] => {
    const selected = (action.groups || []).map((group: Group) => {
        return { id: group.uuid, name: group.name, type: AssetType.Group };
    });

    return selected.concat(
        (action.contacts || []).map((contact: Contact) => {
            return { id: contact.uuid, name: contact.name, type: AssetType.Contact };
        })
    );
};

export const renderAssetList = (assets: Asset[], max: number = 10): JSX.Element[] => {
    return assets.reduce((elements, asset, idx) => {
        if (idx <= max - 1) {
            elements.push(renderAsset(asset));
        } else if (idx > max - 1 && elements.length === max) {
            elements.push(<div key="ellipses">...</div>);
        }
        return elements;
    }, []);
};

export const renderAsset = (asset: Asset) => {
    switch (asset.type) {
        case AssetType.Group:
            return (
                <div className={styles.nodeAsset} key={asset.id}>
                    <span className={`${styles.nodeGroup} fe-group`} />
                    {asset.name}
                </div>
            );
        case AssetType.Label:
            return (
                <div className={styles.nodeAsset} key={asset.id}>
                    <span className={`${styles.nodeLabel} fe-label`} />
                    {asset.name}
                </div>
            );
        case AssetType.Flow:
            return (
                <div className={styles.nodeAsset} key={asset.id}>
                    <span className={`${styles.nodeLabel} fe-split`} />
                    {asset.name}
                </div>
            );
    }

    return (
        <div className={styles.nodeAsset} key={asset.id}>
            {asset.name}
        </div>
    );
};
