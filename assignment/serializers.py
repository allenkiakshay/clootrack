from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
            
    def validate(self, data):
        # For updates, self.instance will be available. For creation, it will be None.
        # Get the status from the current data being validated, or fall back to the existing instance's status
        status = data.get('status', self.instance.status if self.instance else None)
        # Get the description from the current data, or fall back to the existing instance's description
        description = data.get('description', self.instance.description if self.instance else None)

        if status == 'resolved' and not description:
            raise serializers.ValidationError("Description is required when status is resolved.")
        return data
        