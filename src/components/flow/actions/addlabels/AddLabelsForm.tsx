import { react as bindCallbacks } from 'auto-bind';
import * as React from 'react';
import Dialog, { ButtonSet } from '~/components/dialog/Dialog';
import { ActionFormProps } from '~/components/flow/props';
import AssetSelector from '~/components/form/assetselector/AssetSelector';
import TypeList from '~/components/nodeeditor/TypeList';
import { fakePropType } from '~/config/ConfigProvider';
import { Asset, AssetType } from '~/store/flowContext';
import { AssetArrayEntry, FormState, mergeForm } from '~/store/nodeEditor';
import { validate, validateRequired } from '~/store/validators';
import { createUUID } from '~/utils';

import { initializeForm, onUpdated, stateToAction } from './helpers';

export interface AddLabelsFormState extends FormState {
    labels: AssetArrayEntry;
}

export const controlLabelSpecId = 'label';

export default class AddLabelsForm extends React.PureComponent<
    ActionFormProps,
    AddLabelsFormState
> {
    public static contextTypes = {
        assetService: fakePropType
    };

    constructor(props: ActionFormProps) {
        super(props);

        this.state = initializeForm(this.props.nodeSettings);
        bindCallbacks(this, {
            include: [/^on/, /^handle/]
        });
    }

    public handleSave(): void {
        const valid = this.handleLabelsChanged(this.state.labels.value);
        if (valid) {
            const newAction = stateToAction(this.props.nodeSettings, this.state);
            this.props.updateAction(newAction, onUpdated);
            this.props.onClose(false);
        }
    }

    public handleLabelsChanged(selected: Asset[]): boolean {
        const updates: Partial<AddLabelsFormState> = {
            labels: validate('Labels', selected, [validateRequired])
        };

        const updated = mergeForm(this.state, updates);
        this.setState(updated);
        return updated.valid;
    }

    private getButtons(): ButtonSet {
        return {
            primary: { name: 'Ok', onClick: this.handleSave },
            secondary: { name: 'Cancel', onClick: () => this.props.onClose(true) }
        };
    }

    public handleLabelCreated(name: string): void {
        const group = { id: createUUID(), name, type: AssetType.Label };
        this.handleLabelsChanged(this.state.labels.value.concat(group));
    }

    public render(): JSX.Element {
        const typeConfig = this.props.typeConfig;
        return (
            <Dialog
                title={typeConfig.name}
                headerClass={typeConfig.type}
                buttons={this.getButtons()}
            >
                <TypeList
                    __className=""
                    initialType={typeConfig}
                    onChange={this.props.onTypeChange}
                />
                <p data-spec={controlLabelSpecId}>
                    Select the labels to apply to the incoming message.
                </p>

                <AssetSelector
                    name="Labels"
                    placeholder="Enter the name of an existing label or create a new one"
                    assets={this.props.assets.labels}
                    entry={this.state.labels}
                    searchable={true}
                    multi={true}
                    onChange={this.handleLabelsChanged}
                    onCreateOption={this.handleLabelCreated}
                />
            </Dialog>
        );
    }
}
